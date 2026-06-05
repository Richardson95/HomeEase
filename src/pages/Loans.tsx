import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader, Stat } from '@/components/common'
import { TrendingIcon, ShieldCheck, CheckIcon, AlertIcon } from '@/components/icons'
import { formatNaira, formatDate, classNames, canTransact } from '@/lib/utils'
import type { RentLoan, LoanStatus } from '@/types'

export default function Loans() {
  const user = useStore((s) => s.currentUser())!
  const loans = useStore((s) => s.loans.filter((l) => l.tenantId === user.id))
  const applyLoan = useStore((s) => s.applyLoan)
  const updateUser = useStore((s) => s.updateUser)
  const toast = useToast()

  const [principal, setPrincipal] = useState(2_200_000)
  const [tenure, setTenure] = useState<3 | 4 | 5 | 6>(6)
  const [rate] = useState(6)

  const monthly = useMemo(() => Math.round((principal * (1 + rate / 100)) / tenure), [principal, tenure, rate])
  const totalRepay = monthly * tenure

  const kycComplete = canTransact(user) && ['kyc', 'fully_verified'].includes(user.verificationLevel)
  const eligible = kycComplete && !!user.employmentVerified

  function apply() {
    applyLoan({ principal, tenureMonths: tenure, interestRate: rate })
    toast(eligible ? 'Loan pre-approved 🎉' : 'Application submitted for review')
  }

  return (
    <div className="container-app">
      <PageHeader title="Rent Assurance" subtitle="Spread your rent over 3–6 months" back={false} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-ink-700 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <span className="chip bg-white/15 text-white"><TrendingIcon className="h-3.5 w-3.5" /> 5–7% interest · partner microfinance</span>
        <h2 className="relative mt-3 text-2xl font-extrabold">Don’t let rent break the bank.</h2>
        <p className="relative mt-1 text-sm text-white/80">Verified tenants can finance rent and pay back monthly. Quick approval for KYC-complete users.</p>
      </div>

      {/* Eligibility */}
      <div className="mt-4 card p-4">
        <h3 className="mb-3 font-bold text-slate-900">Eligibility checker</h3>
        <ul className="space-y-2.5">
          <EligibilityRow done={kycComplete} label="KYC verified (BVN/NIN)" hint={!kycComplete ? 'Complete identity verification' : undefined} fixHref="/auth/verify" />
          <EligibilityRow
            done={!!user.employmentVerified}
            label="Employment verified"
            hint={!user.employmentVerified ? 'Link employment / income (placeholder)' : undefined}
            onFix={!user.employmentVerified ? () => { updateUser({ employmentVerified: true }); toast('Employment verified ✓') } : undefined}
          />
        </ul>
        <div className={classNames('mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm', eligible ? 'bg-brand-50 text-brand-800' : 'bg-amber-50 text-amber-800')}>
          {eligible ? <CheckIcon className="h-5 w-5" /> : <AlertIcon className="h-5 w-5" />}
          {eligible ? 'You’re eligible for instant pre-approval.' : 'Complete the steps above for instant approval.'}
        </div>
      </div>

      {/* Calculator */}
      <div className="mt-4 card p-5">
        <h3 className="mb-3 font-bold text-slate-900">Repayment calculator</h3>
        <label className="label">Rent amount: <span className="font-bold text-slate-900">{formatNaira(principal)}</span></label>
        <input type="range" min={500_000} max={15_000_000} step={100_000} value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full accent-brand-600" />

        <label className="label mt-4">Tenure</label>
        <div className="grid grid-cols-4 gap-2">
          {([3, 4, 5, 6] as const).map((t) => (
            <button key={t} onClick={() => setTenure(t)} className={classNames('rounded-xl border py-2 text-sm font-semibold transition', tenure === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600')}>{t} mo</button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Monthly repayment" value={formatNaira(monthly, { short: true })} tone="brand" />
          <Stat label={`Total (${rate}% interest)`} value={formatNaira(totalRepay, { short: true })} />
        </div>

        <button onClick={apply} className="btn-primary mt-4 w-full">Apply for {formatNaira(principal, { short: true })}</button>
      </div>

      {/* Applications */}
      {loans.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 font-bold text-slate-900">Your applications</h2>
          <div className="space-y-3">{loans.map((l) => <LoanCard key={l.id} loan={l} />)}</div>
        </>
      )}
    </div>
  )
}

function EligibilityRow({ done, label, hint, fixHref, onFix }: { done: boolean; label: string; hint?: string; fixHref?: string; onFix?: () => void }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={classNames('grid h-6 w-6 shrink-0 place-items-center rounded-full', done ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500')}>
        {done ? <CheckIcon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-slate-400" />}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
      {!done && (onFix ? (
        <button onClick={onFix} className="text-xs font-semibold text-brand-700">Verify</button>
      ) : fixHref ? (
        <Link to={fixHref} className="text-xs font-semibold text-brand-700">{hint || 'Fix'}</Link>
      ) : null)}
    </li>
  )
}

const LOAN_TONE: Record<LoanStatus, string> = {
  draft: 'bg-slate-100 text-slate-600', pending: 'bg-amber-50 text-amber-700', approved: 'bg-brand-50 text-brand-700',
  rejected: 'bg-red-50 text-red-700', active: 'bg-ink-500/10 text-ink-700', repaid: 'bg-slate-100 text-slate-600',
}

function LoanCard({ loan }: { loan: RentLoan }) {
  const paid = loan.repayments.filter((r) => r.paid).length
  const next = loan.repayments.find((r) => !r.paid)
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xl font-extrabold tracking-tight text-slate-900">{formatNaira(loan.principal)}</p>
          <p className="text-sm text-slate-500">{loan.tenureMonths} months · {loan.interestRate}% · {formatNaira(loan.monthlyRepayment)}/mo</p>
        </div>
        <span className={classNames('chip capitalize', LOAN_TONE[loan.status])}>{loan.status}</span>
      </div>

      {(loan.status === 'active' || loan.status === 'approved') && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Repayment progress</span><span>{paid}/{loan.repayments.length} paid</span></div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(paid / loan.repayments.length) * 100}%` }} /></div>
          {next && <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><ShieldCheck className="h-4 w-4 text-brand-600" /> Next payment {formatNaira(next.amount)} due {formatDate(next.dueDate)}</p>}
        </div>
      )}
      {loan.status === 'pending' && <p className="mt-2 text-sm text-amber-700">⏳ Under review — we’ll notify you within 24 hours.</p>}
    </div>
  )
}
