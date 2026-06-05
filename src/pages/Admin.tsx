import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader, Stat, EmptyState } from '@/components/common'
import { Avatar } from '@/components/Avatar'
import { VerifiedBadge, FraudScorePill } from '@/components/Badge'
import { CheckIcon, XIcon, AlertIcon, UsersIcon, DocIcon, WalletIcon, TrendingIcon, ShieldCheck } from '@/components/icons'
import { formatNaira, timeAgo, classNames } from '@/lib/utils'

type Tab = 'overview' | 'approvals' | 'fraud' | 'users' | 'disputes' | 'loans'
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'fraud', label: 'Fraud' },
  { key: 'users', label: 'Users' },
  { key: 'disputes', label: 'Disputes' },
  { key: 'loans', label: 'Loans' },
]

export default function Admin() {
  const [tab, setTab] = useState<Tab>('overview')
  const s = useStore()

  const pending = s.properties.filter((p) => p.status === 'pending_review')
  const flagged = s.properties.filter((p) => p.status === 'flagged')
  const openFraud = s.fraudReports.filter((f) => f.status === 'open' || f.status === 'reviewing')
  const disputes = s.escrow.filter((e) => e.status === 'disputed')

  return (
    <div className="container-wide pb-10">
      <PageHeader title="Admin dashboard" subtitle="Platform operations & trust moderation" back={false}
        action={<span className="hidden chip bg-ink-900 text-white sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" /> Admin</span>} />

      {/* Tabs */}
      <div className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const count = t.key === 'approvals' ? pending.length : t.key === 'fraud' ? openFraud.length : t.key === 'disputes' ? disputes.length : 0
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={classNames('shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition', tab === t.key ? 'bg-ink-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50')}>
              {t.label}{count > 0 && <span className={classNames('ml-1.5 rounded-full px-1.5 text-xs', tab === t.key ? 'bg-white/20' : 'bg-red-100 text-red-600')}>{count}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'approvals' && <Approvals pending={pending} />}
      {tab === 'fraud' && <FraudQueue />}
      {tab === 'users' && <Users />}
      {tab === 'disputes' && <Disputes disputes={disputes} />}
      {tab === 'loans' && <LoansMonitor />}
    </div>
  )
}

function Overview() {
  const s = useStore()
  const published = s.properties.filter((p) => p.status === 'published')
  const verifiedUsers = s.users.filter((u) => u.verificationLevel === 'fully_verified').length
  const verifyRate = Math.round((verifiedUsers / s.users.length) * 100)
  const completedInsp = s.inspections.length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Live listings" value={published.length} tone="brand" />
        <Stat label="Verification rate" value={`${verifyRate}%`} />
        <Stat label="Inspections booked" value={completedInsp} />
        <Stat label="Fraud reports" value={s.fraudReports.length} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-slate-900">Listings by status</h3>
          {(['published', 'pending_review', 'flagged', 'rejected', 'rented'] as const).map((st) => {
            const n = s.properties.filter((p) => p.status === st).length
            const pct = Math.round((n / s.properties.length) * 100) || 0
            return (
              <div key={st} className="mb-2.5">
                <div className="mb-1 flex justify-between text-sm"><span className="capitalize text-slate-600">{st.replace('_', ' ')}</span><span className="font-semibold text-slate-800">{n}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={classNames('h-full rounded-full', st === 'flagged' ? 'bg-red-500' : st === 'pending_review' ? 'bg-amber-500' : 'bg-brand-600')} style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-bold text-slate-900">Escrow under management</h3>
          <p className="text-3xl font-extrabold text-slate-900">{formatNaira(s.escrow.reduce((a, e) => a + e.amount, 0))}</p>
          <p className="text-sm text-slate-500">across {s.escrow.length} transactions</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Active loans" value={s.loans.filter((l) => l.status === 'active' || l.status === 'approved').length} />
            <Stat label="Open disputes" value={s.escrow.filter((e) => e.status === 'disputed').length} tone="amber" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Approvals({ pending }: { pending: ReturnType<typeof useStore.getState>['properties'] }) {
  const { approveProperty, rejectProperty } = useStore()
  const toast = useToast()
  if (!pending.length) return <EmptyState icon={<DocIcon className="h-7 w-7" />} title="No listings awaiting review" body="New submissions will appear here for field verification." />
  return (
    <div className="space-y-3">
      {pending.map((p) => (
        <div key={p.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <Link to={`/listing/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <img src={p.images[0]} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{p.title}</p><p className="text-sm text-slate-500">{p.location} · {formatNaira(p.rent, { short: true })}/yr</p><FraudScorePill score={p.fraudScore} /></div>
          </Link>
          <div className="flex gap-2">
            <button onClick={() => { approveProperty(p.id); toast('Listing approved & verified ✓') }} className="btn-primary h-9 flex-1 sm:flex-none"><CheckIcon className="h-4 w-4" /> Approve</button>
            <button onClick={() => { rejectProperty(p.id); toast('Listing rejected', 'info') }} className="btn-secondary h-9 flex-1 text-red-600 sm:flex-none"><XIcon className="h-4 w-4" /> Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function FraudQueue() {
  const s = useStore()
  const toast = useToast()
  const reports = s.fraudReports.filter((f) => f.status === 'open' || f.status === 'reviewing')
  if (!reports.length) return <EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="Fraud queue is clear" body="Duplicate or suspicious listings are routed here automatically." />
  return (
    <div className="space-y-3">
      {reports.map((f) => {
        const prop = s.properties.find((p) => p.id === f.propertyId)
        const match = f.matchedPropertyId ? s.properties.find((p) => p.id === f.matchedPropertyId) : undefined
        return (
          <div key={f.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600"><AlertIcon className="h-5 w-5" /></span>
                <div><p className="font-semibold text-slate-800">{prop?.title || 'Listing'}</p><p className="text-xs text-slate-400">Reported {timeAgo(f.createdAt)}</p></div>
              </div>
              <FraudScorePill score={f.fraudScore} />
            </div>
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{f.reason}</p>
            {match && (
              <Link to={`/listing/${match.id}`} className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm hover:bg-slate-100">
                <img src={match.images[0]} alt="" className="h-9 w-11 rounded object-cover" />
                <span className="text-slate-600">Matches verified listing: <span className="font-medium text-slate-800">{match.title}</span></span>
              </Link>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => { s.resolveFraud(f.id, 'resolved'); if (prop) s.removeProperty(prop.id); toast('Confirmed fraud — listing removed') }} className="btn-danger h-9 flex-1"><XIcon className="h-4 w-4" /> Remove listing</button>
              <button onClick={() => { s.resolveFraud(f.id, 'dismissed'); toast('Dismissed — listing returned to review') }} className="btn-secondary h-9 flex-1">Not fraud</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Users() {
  const s = useStore()
  const toast = useToast()
  return (
    <div className="space-y-2">
      {s.users.map((u) => (
        <div key={u.id} className="card flex items-center gap-3 p-3">
          <Avatar name={u.name} src={u.avatarUrl} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">{u.name}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="chip bg-slate-100 capitalize text-slate-600">{u.role}</span>
              {u.badges[0] && <VerifiedBadge type={u.badges[0]} size="xs" />}
              {u.verificationLevel === 'unverified' && <span className="chip bg-amber-50 text-amber-700">Unverified</span>}
            </div>
          </div>
          {u.role !== 'admin' && (
            <button onClick={() => { s.suspendUser(u.id); toast(`${u.name} suspended`, 'info') }} className="btn-secondary h-9 text-red-600">Suspend</button>
          )}
        </div>
      ))}
    </div>
  )
}

function Disputes({ disputes }: { disputes: ReturnType<typeof useStore.getState>['escrow'] }) {
  const s = useStore()
  const toast = useToast()
  if (!disputes.length) return <EmptyState icon={<WalletIcon className="h-7 w-7" />} title="No active disputes" body="Escrow disputes raised by tenants appear here for mediation." />
  return (
    <div className="space-y-3">
      {disputes.map((e) => {
        const prop = s.properties.find((p) => p.id === e.propertyId)
        return (
          <div key={e.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-semibold text-slate-800">{prop?.title || 'Property'}</p><p className="text-sm text-slate-500">{formatNaira(e.amount)} in escrow</p></div>
              <span className="chip bg-red-50 text-red-700">Disputed</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { s.resolveDispute(e.id, 'release'); toast('Resolved — funds released to landlord') }} className="btn-primary h-9 flex-1">Release to landlord</button>
              <button onClick={() => { s.resolveDispute(e.id, 'refund'); toast('Resolved — refunded to tenant', 'info') }} className="btn-secondary h-9 flex-1">Refund tenant</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LoansMonitor() {
  const s = useStore()
  if (!s.loans.length) return <EmptyState icon={<TrendingIcon className="h-7 w-7" />} title="No loan applications" body="Rent Assurance applications appear here for monitoring." />
  return (
    <div className="space-y-2">
      {s.loans.map((l) => {
        const tenant = s.users.find((u) => u.id === l.tenantId)
        const paid = l.repayments.filter((r) => r.paid).length
        return (
          <div key={l.id} className="card flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{tenant?.name || 'Tenant'} · {formatNaira(l.principal, { short: true })}</p>
              <p className="text-sm text-slate-500">{l.tenureMonths}mo @ {l.interestRate}% · {paid}/{l.repayments.length} repaid</p>
            </div>
            <span className={classNames('chip capitalize', l.status === 'active' ? 'bg-ink-500/10 text-ink-700' : l.status === 'approved' ? 'bg-brand-50 text-brand-700' : l.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600')}>{l.status}</span>
          </div>
        )
      })}
    </div>
  )
}
