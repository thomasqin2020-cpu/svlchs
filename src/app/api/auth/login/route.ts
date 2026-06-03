import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Email + password login. Accepts both JSON (AJAX) and form-data (native form
 * POST). On a form submit we respond with a 303 redirect carrying the auth
 * cookies, so the browser handles the navigation chain natively — that's
 * dramatically more reliable than fetch + window.location.assign for
 * persisting Set-Cookie across the navigation boundary.
 */
export async function POST(request: NextRequest) {
  const ct = request.headers.get('content-type') ?? ''
  const isForm = ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')

  let email = ''
  let password = ''
  let next = '/'

  // Only allow same-origin relative paths. A bare startsWith('/') check lets
  // protocol-relative URLs like "//evil.com" (and "/\evil.com") through, which
  // new URL() then resolves to a different origin — an open redirect / phishing
  // vector on the post-login navigation.
  const safeNext = (v: string) =>
    v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : '/'

  if (isForm) {
    const fd = await request.formData()
    email = String(fd.get('email') ?? '').trim().toLowerCase()
    password = String(fd.get('password') ?? '')
    next = safeNext(String(fd.get('next') ?? '/').trim())
  } else {
    const body = await request.json().catch(() => null)
    email = String(body?.email ?? '').trim().toLowerCase()
    password = String(body?.password ?? '')
    next = typeof body?.next === 'string' ? safeNext(body.next) : '/'
  }

  // Helper: respond with the right shape for the request type.
  const fail = (status: number, message: string, errParam: string) => {
    if (isForm) {
      const url = new URL('/login', request.url)
      url.searchParams.set('error', errParam)
      url.searchParams.set('next', next)
      return NextResponse.redirect(url, 303)
    }
    return NextResponse.json({ ok: false, message }, { status })
  }

  if (!email || !email.includes('@')) {
    return fail(400, 'Please enter a valid email.', 'invalid_email')
  }
  if (!password) {
    return fail(400, 'Please enter your password.', 'missing_password')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return fail(503, 'Login is not configured yet.', 'not_configured')
  }

  // Pre-build the success response so cookies write straight onto it.
  const successUrl = new URL(next, request.url)
  const response = isForm
    ? NextResponse.redirect(successUrl, 303)
    : NextResponse.json({ ok: true, message: 'Signed in.', signedIn: true, next })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          // HttpOnly always; Secure only in production. Forcing Secure in dev
          // drops the cookie over plain HTTP on non-localhost hosts (e.g.
          // testing from a phone on a LAN IP), silently logging the user out.
          response.cookies.set(name, value, { ...options, secure: process.env.NODE_ENV === 'production', httpOnly: true })
        })
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('signInWithPassword failed:', error)
    const status = (error as { status?: number }).status
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('invalid') || status === 400 || status === 401) {
      return fail(401, 'Wrong email or password. If you haven’t set a password yet, use the link below.', 'invalid_credentials')
    }
    if (status === 429 || msg.includes('rate')) {
      return fail(429, 'Too many attempts. Wait a minute and try again.', 'rate_limited')
    }
    return fail(500, 'Could not log you in. Try again.', 'unknown')
  }

  return response
}
