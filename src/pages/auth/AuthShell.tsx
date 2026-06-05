import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { ShieldCheck } from '@/components/icons'

const TRUST = [
  'BVN / NIN identity verification',
  'Physically inspected, verified listings',
  'Escrow-protected rent payments',
]

/** Two-panel auth layout: brand story on desktop, focused form on mobile. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-white">
      {/* Brand panel — desktop only */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex">
        <div className="absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <Link to="/" className="relative"><Logo className="[&_*]:!text-white" /></Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">Lagos' most trusted<br />rental marketplace.</h2>
          <p className="mt-3 max-w-sm text-white/70">Verified people. Verified homes. Escrow-protected payments. No more fake agents or lost deposits.</p>
          <ul className="mt-8 space-y-3">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-white/90">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600/30 text-brand-300"><ShieldCheck className="h-5 w-5" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">© 2026 HomeEase. Built for Lagos.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10">
          <div className="w-full max-w-sm animate-fade-in">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
