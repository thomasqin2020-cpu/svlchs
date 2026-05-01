import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Email + password login. Sets auth cookies onto the response directly so they
 * survive the Server-Action / next/headers cookie quirk that left passwords
 * succeeding once but not persisting across reloads. Pattern mirrors the
 * /auth/callback route handler.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const next = typeof body?.next === 'string' && body.next.startsWith('/') ? body.next : '/'

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, message: 'Please enter a valid email.' }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ ok: false, message: 'Please enter your password.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ ok: false, message: 'Login is not configured yet.' }, { status: 503 })
  }

  // Pre-build the response so Supabase can write cookies straight onto it.
  const response = NextResponse.json({ ok: true, message: 'Signed in.', signedIn: true, next })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          // Force Secure + HttpOnly. Without Secure, Chromium evicts these
          // cookies across navigations on HTTPS (the previous fix wrote them
          // without Secure and they vanished on every page nav).
          response.cookies.set(name, value, { ...options, secure: true, httpOnly: true })
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
      return NextResponse.json({
        ok: false,
        message: 'Wrong email or password. If you haven’t set a password yet, use the link below.',
      }, { status: 401 })
    }
    if (status === 429 || msg.includes('rate')) {
      return NextResponse.json({ ok: false, message: 'Too many attempts. Wait a minute and try again.' }, { status: 429 })
    }
    return NextResponse.json({ ok: false, message: 'Could not log you in. Try again.' }, { status: 500 })
  }

  return response
}
