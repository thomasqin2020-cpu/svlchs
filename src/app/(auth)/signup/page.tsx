import { Suspense } from 'react'
import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-card-v2"><p className="auth-sub-v2">Loading…</p></div>}>
      <SignupForm />
    </Suspense>
  )
}
