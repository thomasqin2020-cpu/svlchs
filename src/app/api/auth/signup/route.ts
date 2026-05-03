import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, notifyOfficers, membershipAckEmail, membershipNotifyEmail } from '@/lib/email'

const PASSWORD_MIN = 8

const ERROR_TO_PARAM: Record<string, string> = {
  missing_fields: 'missing_fields',
  invalid_email: 'invalid_email',
  short_password: 'short_password',
  not_configured: 'not_configured',
  already_member: 'already_member',
  bad_code: 'bad_code',
  create_failed: 'create_failed',
  unknown: 'unknown',
}

/**
 * Sign up + immediate sign-in. Like /api/auth/login, accepts both JSON and
 * form-data; on a form submit it returns a 303 redirect with the auth cookies
 * so the browser handles the navigation + Set-Cookie commit natively.
 */
export async function POST(request: NextRequest) {
  const ct = request.headers.get('content-type') ?? ''
  const isForm = ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')

  let email = ''
  let password = ''
  let code = ''
  let fullName = ''
  let grade = ''
  let why = ''

  if (isForm) {
    const fd = await request.formData()
    email = String(fd.get('email') ?? '').trim().toLowerCase()
    password = String(fd.get('password') ?? '')
    code = String(fd.get('classroom_code') ?? '').trim().toLowerCase()
    fullName = String(fd.get('full_name') ?? '').trim()
    grade = String(fd.get('grade') ?? '').trim()
    why = String(fd.get('why_joining') ?? '').trim()
  } else {
    const body = await request.json().catch(() => null)
    email = String(body?.email ?? '').trim().toLowerCase()
    password = String(body?.password ?? '')
    code = String(body?.classroom_code ?? '').trim().toLowerCase()
    fullName = String(body?.full_name ?? '').trim()
    grade = String(body?.grade ?? '').trim()
    why = String(body?.why_joining ?? '').trim()
  }

  const fail = (status: number, message: string, errParam: string) => {
    if (isForm) {
      const url = new URL('/signup', request.url)
      url.searchParams.set('error', ERROR_TO_PARAM[errParam] ?? 'unknown')
      return NextResponse.redirect(url, 303)
    }
    return NextResponse.json({ ok: false, message }, { status })
  }

  if (!email || !code || !fullName || !password) {
    return fail(400, 'Email, password, name, and Classroom code are required.', 'missing_fields')
  }
  if (!email.includes('@')) {
    return fail(400, 'That email looks invalid.', 'invalid_email')
  }
  if (password.length < PASSWORD_MIN) {
    return fail(400, `Password must be at least ${PASSWORD_MIN} characters.`, 'short_password')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return fail(503, 'Sign-up is not configured yet.', 'not_configured')
  }
  const admin = createSupabaseAdminClient()
  if (!admin) {
    return fail(503, 'Sign-up is not configured yet.', 'not_configured')
  }

  const { data: existingMember } = await admin
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existingMember) {
    return fail(409, 'That email is already a Spartan Vanguard member. Log in instead.', 'already_member')
  }

  const { data: codeRow, error: codeError } = await admin
    .from('allowed_classroom_codes')
    .select('code')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle()
  if (codeError) {
    console.error('classroom code lookup failed:', codeError)
    return fail(500, 'Could not verify that Classroom code. Try again.', 'unknown')
  }
  if (!codeRow) {
    return fail(403, 'That Classroom code is not valid. Ask an officer for the current code.', 'bad_code')
  }

  await admin.from('membership_signups').insert({
    name: fullName,
    grade: grade || null,
    email,
    why_joining: why || null,
  })

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, grade },
  })
  if (createError || !created.user) {
    console.error('admin.createUser failed:', createError)
    const msg = (createError?.message || '').toLowerCase()
    if (msg.includes('already') || msg.includes('exists')) {
      return fail(409, 'That email is already registered. Try logging in or use the “forgot password” link.', 'already_member')
    }
    return fail(500, 'Could not create your account. Try again.', 'create_failed')
  }

  // Mirror the auth user into public.members so getCurrentMember() returns a
  // profile and the homepage account chip renders. Without this row, the user
  // is signed in but every server-side `members` lookup returns null.
  const { error: memberInsertError } = await admin.from('members').upsert(
    {
      id: created.user.id,
      email,
      full_name: fullName,
      grade: grade || null,
      role: 'member',
    },
    { onConflict: 'id' },
  )
  if (memberInsertError) {
    console.error('members upsert failed:', memberInsertError)
  }

  sendEmail({ to: email, subject: 'Welcome to Spartan Vanguard', html: membershipAckEmail(fullName) }).catch(() => {})
  notifyOfficers({
    subject: `New SV sign-up: ${fullName}`,
    html: membershipNotifyEmail({ name: fullName, email, grade, why }),
  }).catch(() => {})

  // Sign them in. Cookies write straight onto the prepared response —
  // for form submits that's a 303 redirect to /, for JSON it's a JSON body.
  const successUrl = new URL('/', request.url)
  const response = isForm
    ? NextResponse.redirect(successUrl, 303)
    : NextResponse.json({ ok: true, message: 'Welcome!', signedIn: true })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, { ...options, secure: true, httpOnly: true })
        })
      },
    },
  })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.error('post-signup signInWithPassword failed:', signInError)
    if (isForm) {
      const url = new URL('/login', request.url)
      url.searchParams.set('message', 'created')
      return NextResponse.redirect(url, 303)
    }
    return NextResponse.json({ ok: true, message: 'Account created. Please log in to continue.' })
  }

  return response
}
