import { useStore } from '@/lib/store'
import { useToast } from './Toast'
import { CheckIcon, WalletIcon, PlusIcon } from './icons'
import { LISTING_PLANS, formatNaira, classNames } from '@/lib/utils'
import type { PlanTier } from '@/types'

/** Subscription plans grid + wallet funding. Used to unlock/upgrade listing quota. */
export function PlanPicker({ onSubscribed }: { onSubscribed?: () => void }) {
  const user = useStore((s) => s.currentUser())!
  const active = useStore((s) => s.activeSubscription(user.id))
  const subscribePlan = useStore((s) => s.subscribePlan)
  const topUpWallet = useStore((s) => s.topUpWallet)
  const toast = useToast()

  function choose(tier: PlanTier) {
    const res = subscribePlan(tier)
    if (!res.ok) { toast(res.error || 'Could not subscribe.', 'error'); return }
    toast('Plan activated — you can list now 🎉')
    onSubscribed?.()
  }

  return (
    <div>
      {/* Wallet balance + demo top-up */}
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-brand-300" />
          <div>
            <p className="text-xs text-white/60">Wallet balance</p>
            <p className="text-lg font-extrabold tracking-tight">{formatNaira(user.walletBalance)}</p>
          </div>
        </div>
        <button onClick={() => { topUpWallet(20000); toast('₦20,000 added to wallet (demo)') }} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">
          <PlusIcon className="h-4 w-4" /> Add funds
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {LISTING_PLANS.map((plan) => {
          const isCurrent = active?.tier === plan.tier
          const unlimited = plan.listingQuota >= 999
          return (
            <div
              key={plan.tier}
              className={classNames('relative flex flex-col rounded-2xl border p-4 transition',
                plan.popular ? 'border-brand-500 shadow-card ring-1 ring-brand-500/20' : 'border-slate-200')}
            >
              {plan.popular && <span className="absolute -top-2.5 left-4 chip bg-brand-600 text-white shadow-sm">Most popular</span>}
              <p className="font-bold text-slate-900">{plan.name}</p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">{formatNaira(plan.price)}</span>
                <span className="text-xs text-slate-400">/mo</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-700">{unlimited ? 'Unlimited listings' : `${plan.listingQuota} listings`}</p>
              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />{perk}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(plan.tier)}
                disabled={isCurrent}
                className={classNames('mt-4 w-full', plan.popular ? 'btn-primary' : 'btn-secondary', isCurrent && 'opacity-60')}
              >
                {isCurrent ? 'Current plan' : `Pay ${formatNaira(plan.price)}`}
              </button>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">Billed from your HomeEase wallet. Plans renew monthly · unused slots roll over on upgrade.</p>
    </div>
  )
}
