import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader, EmptyState, Stat } from '@/components/common'
import { WalletIcon, ShieldCheck, CheckIcon, AlertIcon, DocIcon } from '@/components/icons'
import { formatNaira, formatDate, timeAgo, classNames } from '@/lib/utils'
import type { EscrowTransaction, EscrowStatus } from '@/types'
import { Link } from 'react-router-dom'

const STATUS_META: Record<EscrowStatus, { label: string; tone: string; dot: string }> = {
  pending: { label: 'Pending', tone: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  held: { label: 'Held in escrow', tone: 'bg-ink-500/10 text-ink-700', dot: 'bg-ink-500' },
  released: { label: 'Released', tone: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  disputed: { label: 'Disputed', tone: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  refunded: { label: 'Refunded', tone: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

export default function Wallet() {
  const user = useStore((s) => s.currentUser())!
  const escrow = useStore((s) => s.escrow)
  const topUpWallet = useStore((s) => s.topUpWallet)
  const toast = useToast()

  const mine = escrow.filter((e) => e.tenantId === user.id || e.landlordId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const held = mine.filter((e) => e.status === 'held').reduce((s, e) => s + e.amount, 0)
  const isLandlord = user.role === 'landlord' || user.role === 'agent'

  return (
    <div className="container-app">
      <PageHeader title="Escrow wallet" subtitle="Trust-protected rent payments" back={false} />

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative flex items-center gap-2 text-white/70"><WalletIcon className="h-5 w-5" /><span className="text-sm font-medium">{isLandlord ? 'Available balance' : 'In escrow (held)'}</span></div>
        <p className="relative mt-1 text-4xl font-extrabold tracking-tight">{formatNaira(isLandlord ? user.walletBalance : held)}</p>
        <p className="relative mt-1 text-sm text-white/60">{isLandlord ? 'Released funds & balance for listing plans' : 'Released only after you confirm move-in'}</p>
        {isLandlord && (
          <button onClick={() => { topUpWallet(20000); toast('₦20,000 added to wallet (demo)') }} className="relative mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">
            + Add funds
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Transactions" value={mine.length} />
        <Stat label="Funds held" value={formatNaira(held, { short: true })} tone="brand" />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
        <ShieldCheck className="h-5 w-5 shrink-0" /> Funds are never released before move-in confirmation. Every transaction has a 7-day dispute window.
      </div>

      <h2 className="mb-2 mt-6 font-bold text-slate-900">Transaction history</h2>
      {mine.length === 0 ? (
        <EmptyState icon={<WalletIcon className="h-7 w-7" />} title="No transactions yet" body="When you pay rent via escrow, it will appear here with full tracking." action={<Link to="/search" className="btn-primary">Find a home</Link>} />
      ) : (
        <div className="space-y-3">{mine.map((tx) => <EscrowCard key={tx.id} tx={tx} isTenant={tx.tenantId === user.id} />)}</div>
      )}
    </div>
  )
}

function EscrowCard({ tx, isTenant }: { tx: EscrowTransaction; isTenant: boolean }) {
  const property = useStore((s) => s.properties.find((p) => p.id === tx.propertyId))
  const confirmMoveIn = useStore((s) => s.confirmMoveIn)
  const disputeEscrow = useStore((s) => s.disputeEscrow)
  const toast = useToast()
  const meta = STATUS_META[tx.status]
  const daysLeft = Math.max(0, Math.ceil((new Date(tx.disputeWindowEnds).getTime() - Date.now()) / 86400000))

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {property && <img src={property.images[0]} alt="" className="h-14 w-16 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 font-semibold text-slate-800">{property?.title || 'Property'}</p>
            <span className={classNames('chip', meta.tone)}><span className={classNames('h-1.5 w-1.5 rounded-full', meta.dot)} /> {meta.label}</span>
          </div>
          <p className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900">{formatNaira(tx.amount)}</p>
          <p className="text-xs text-slate-400">Started {timeAgo(tx.createdAt)}{tx.status === 'held' && ` · dispute window: ${daysLeft}d left`}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-slate-100 px-4 py-3">
        <ol className="space-y-2">
          {tx.timeline.map((step, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><CheckIcon className="h-3.5 w-3.5" /></span>
              <span className="flex-1 text-slate-600">{step.label}</span>
              <span className="text-xs text-slate-400">{formatDate(step.at)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      {tx.status === 'held' && isTenant && (
        <div className="flex gap-2 border-t border-slate-100 p-3">
          <button onClick={() => { confirmMoveIn(tx.id); toast('Move-in confirmed — funds released ✓') }} className="btn-primary h-9 flex-1"><CheckIcon className="h-4 w-4" /> Confirm move-in & release</button>
          <button onClick={() => { disputeEscrow(tx.id); toast('Dispute raised — HomeEase will mediate', 'info') }} className="btn h-9 flex-1 text-red-600 hover:bg-red-50"><AlertIcon className="h-4 w-4" /> Raise dispute</button>
        </div>
      )}
      {tx.status === 'released' && (
        <button onClick={() => toast('Receipt downloaded (demo)')} className="flex w-full items-center justify-center gap-2 border-t border-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><DocIcon className="h-4 w-4" /> Download receipt</button>
      )}
      {tx.status === 'disputed' && (
        <div className="border-t border-slate-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">Under review by HomeEase mediation team.</div>
      )}
    </div>
  )
}
