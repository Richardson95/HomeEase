import type { BadgeType } from '@/types'
import { ShieldCheck, StarIcon } from './icons'
import { classNames } from '@/lib/utils'

const CONFIG: Record<BadgeType, { label: string; cls: string }> = {
  verified_user: { label: 'Verified User', cls: 'bg-brand-50 text-brand-700 ring-brand-200' },
  verified_landlord: { label: 'Verified Landlord', cls: 'bg-brand-50 text-brand-700 ring-brand-200' },
  verified_agent: { label: 'Verified Agent', cls: 'bg-ink-500/10 text-ink-700 ring-ink-500/20' },
  trusted: { label: 'Trusted', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

export function VerifiedBadge({ type, size = 'sm' }: { type: BadgeType; size?: 'sm' | 'xs' }) {
  const c = CONFIG[type]
  return (
    <span className={classNames('chip ring-1 ring-inset', c.cls, size === 'xs' && 'px-2 py-0.5 text-[11px]')}>
      {type === 'trusted' ? <StarIcon className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
      {c.label}
    </span>
  )
}

export function VerifiedPropertyTag() {
  return (
    <span className="chip bg-brand-600 text-white shadow-sm">
      <ShieldCheck className="h-3.5 w-3.5" /> Verified
    </span>
  )
}

export function FeaturedTag() {
  return <span className="chip bg-amber-400 text-amber-950 shadow-sm">★ Featured</span>
}

/** Compact fraud-score pill for the admin views. */
export function FraudScorePill({ score }: { score: number }) {
  const tone = score >= 70 ? 'bg-red-100 text-red-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-700'
  return <span className={classNames('chip', tone)}>Fraud {score}%</span>
}
