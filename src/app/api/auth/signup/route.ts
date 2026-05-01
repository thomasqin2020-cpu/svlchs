import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, notifyOfficers, membershipAckEmail, membershipNotifyEmail } from '@/lib/email'

const PASSWORD_MIN = 8

/**
 * Sign up + immediate sign-in. Pattern mirrors the /auth/callback route
 * handler: cookies written explicitly onto the prepared response so they
 * survive across reloads.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const code = String(body?.classroom_code ?? '').trim().toLowerCase()
  const fullName = String(body?.full_name ?? '').trim()
  const grade = String(body?.grade ?? '').trim()
  const why = String(body?.why_joining ?? '').trim()

  if (!email || !code || !fullName || !password) {
    return NextResponse.json({
      ok: false,
      message: 'Email, password, name, and Classroom code are required.',
    }, { status: 400 })
  }
  if (!email.includes('@')) {
    return NextResponse.json({ ok: false, message: 'That email looks invalid.' }, { status: 400 })
  }
  if (password.length < PASSWORD_MIN) {
    return NextResponse.json({
      ok: false,
      message: `Password must be at least ${PASSWORD_MIN} characters.`,
    }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ ok: false, message: 'Sign-up is not configured yet.' }, { status: 503 })
  }
  const admin = createSupabaseAdminClient()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Sign-up is not configured yet.' }, { status: 503 })
  }

  // Block re-signups for already-registered emails.
  const { data: existingMember } = await admin
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existingMember) {
    return NextResponse.json({
      ok: false,
      message: 'That email is already a Spartan Vanguard member. Log in instead.',
    }, { status: 409 })
  }

  // Validate classroom code.
  const { data: codeRow, error: codeError } = await admin
    .from('allowed_classroom_codes')
    .select('code')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle()
  if (codeError) {
    console.error('classroom code lookup failed:', codeError)
    return NextResponse.json({ ok: false, message: 'Could not verify that Classroom code. Try again.' }, { status: 500 })
  }
  if (!codeRow) {
    return NextResponse.json({
      ok: false,
      message: 'That Classroom code is not valid. Ask an officer for the current code.',
    }, { status: 403 })
  }

  // Log the membership signup intent.
  await admin.from('membership_signups').insert({
    name: fullName,
    grade: grade || null,
    email,
    why_joining: why || null,
  })

  // Create the auth user with email auto-confirmed (Classroom code is the gate).
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
      return NextResponse.json({
        ok: false,
        message: 'That email is already registered. Try logging in or use the “forgot password” link.',
      }, { status: 409 })
    }
    return NextResponse.json({ ok: false, message: 'Could not create your account. Try again.' }, { status: 500 })
  }

  // Fire-and-forget acknowledgement and officer notification.
  sendEmail({ to: email, subject: 'Welcome to Spartan Vanguard', html: membershipAckEmail(fullName) }).catch(() => {})
  notifyOfficers({
    subject: `New SV sign-up: ${fullName}`,
    html: membershipNotifyEmail({ name: fullName, email, grade, why }),
  }).catch(() => {})

  // Now sign them in via the SSR client so the auth cookies land on the
  // canonical host. Use the same explicit-mirror pattern as /auth/callback.
  const response = NextResponse.json({ ok: true, message: 'Welcome!', signedIn: true })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          // Force Secure + HttpOnly so Chromium doesn't evict the auth cookie
          // across navigations on HTTPS.
          response.cookies.set(name, value, { ...options, secure: true, httpOnly: true })
        })
      },
    },
  })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.error('post-signup signInWithPassword failed:', signInError)
    return NextResponse.json({
      ok: true,
      message: 'Account created. Please log in to continue.',
    })
  }

  return response
}
