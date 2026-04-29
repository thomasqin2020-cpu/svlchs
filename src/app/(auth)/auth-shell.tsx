'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const SpiralBg = dynamic(() => import('../donate/spiral-bg').then((m) => m.SpiralBg), {
  ssr: false,
  loading: () => null,
})

function LambdaMark({ size = 18 }: { size?: number }) {
  const sw = Math.max(1.6, size * 0.085)
  const inset = size * 0.12
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="#F8FBF8"
      strokeWidth={sw}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d={`M ${inset} ${size - inset} L ${size / 2} ${inset} L ${size - inset} ${size - inset}`}
      />
    </svg>
  )
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  // Reveal observer (same pattern as donate page).
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.setAttribute('data-revealed', '')
        })
      },
      { threshold: 0.1 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="auth-page">
      <SpiralBg />

      <div className="dp-brand-bar">
        <span className="dp-brand-mark">
          <LambdaMark />
        </span>
        <Link href="/" style={{ color: 'inherit' }}>
          Spartan Vanguard
        </Link>
        <span className="dp-est">EST · 2019</span>
      </div>

      <main className="auth-page-main">
        <div data-reveal>{children}</div>
      </main>
    </div>
  )
}
