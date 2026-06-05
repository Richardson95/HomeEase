import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ChevronLeft } from './icons'
import { classNames } from '@/lib/utils'

export function PageHeader({ title, subtitle, action, back = true }: { title: string; subtitle?: string; action?: ReactNode; back?: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="mb-4 flex items-start gap-2">
      {back && (
        <button onClick={() => navigate(-1)} aria-label="Back" className="-ml-1 mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center animate-fade-in">
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 ring-1 ring-brand-100">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {body && <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900">
        <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" />
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Stat({ label, value, tone = 'default' }: { label: string; value: ReactNode; tone?: 'default' | 'brand' | 'amber' | 'red' }) {
  return (
    <div className={classNames('rounded-2xl p-4 shadow-soft ring-1 transition',
      tone === 'brand' && 'bg-gradient-to-br from-brand-50 to-white ring-brand-100',
      tone === 'amber' && 'bg-gradient-to-br from-amber-50 to-white ring-amber-100',
      tone === 'red' && 'bg-gradient-to-br from-red-50 to-white ring-red-100',
      tone === 'default' && 'bg-white ring-slate-900/[0.04]',
    )}>
      <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}
