import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader } from '@/components/common'
import { CheckIcon, PhoneIcon, ShieldCheck, CameraIcon, DocIcon, ChevronRight } from '@/components/icons'
import { classNames } from '@/lib/utils'

type StepKey = 'email' | 'phone' | 'bvn_nin' | 'selfie' | 'role_docs'

export default function Verify() {
  const user = useStore((s) => s.currentUser())!
  const { verifyEmail, verifyPhone, verifyBvnNin, verifySelfie, verifyRoleDocs } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [active, setActive] = useState<StepKey | null>(null)

  const needsRoleDocs = user.role === 'landlord' || user.role === 'agent'

  const steps = useMemo(() => {
    const base: { key: StepKey; label: string; desc: string; done: boolean; Icon: typeof PhoneIcon }[] = [
      { key: 'email', label: 'Confirm email', desc: 'Verify your email address', done: user.kyc.emailVerified, Icon: CheckIcon },
      { key: 'phone', label: 'Phone OTP', desc: 'Verify your phone number', done: user.kyc.phoneVerified, Icon: PhoneIcon },
      { key: 'bvn_nin', label: 'BVN / NIN', desc: 'Identity verification (KYC)', done: user.kyc.bvnNinVerified, Icon: ShieldCheck },
      { key: 'selfie', label: 'Selfie liveness', desc: 'Confirm you are a real person', done: user.kyc.selfieVerified, Icon: CameraIcon },
    ]
    if (needsRoleDocs)
      base.push({ key: 'role_docs', label: user.role === 'landlord' ? 'Ownership documents' : 'Agent license', desc: user.role === 'landlord' ? 'C of O / Deed of assignment' : 'Professional license & office', done: user.kyc.roleDocsVerified, Icon: DocIcon })
    return base
  }, [user, needsRoleDocs])

  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)
  const allDone = completed === steps.length

  return (
    <div className="container-app">
      <PageHeader title="Verify your account" subtitle="Verified members can list, book inspections and transact." />

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Verification progress</p>
            <p className="text-2xl font-extrabold text-slate-900">{pct}% complete</p>
          </div>
          <span className={classNames('chip ring-1 ring-inset', allDone ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-amber-50 text-amber-700 ring-amber-200')}>
            {allDone ? 'Fully verified' : `${steps.length - completed} step${steps.length - completed > 1 ? 's' : ''} left`}
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-4 space-y-2.5">
        {steps.map((step) => (
          <div key={step.key} className={classNames('card overflow-hidden transition', active === step.key && 'ring-2 ring-brand-500')}>
            <button
              onClick={() => !step.done && setActive(active === step.key ? null : step.key)}
              disabled={step.done}
              className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-default"
            >
              <span className={classNames('grid h-10 w-10 shrink-0 place-items-center rounded-xl', step.done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>
                {step.done ? <CheckIcon className="h-6 w-6" /> : <step.Icon className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-800">{step.label}</span>
                <span className="block text-sm text-slate-500">{step.desc}</span>
              </span>
              {step.done ? (
                <span className="chip bg-brand-50 text-brand-700">Verified</span>
              ) : (
                <ChevronRight className={classNames('h-5 w-5 text-slate-400 transition', active === step.key && 'rotate-90')} />
              )}
            </button>

            {active === step.key && !step.done && (
              <div className="border-t border-slate-100 p-4 animate-fade-in">
                <StepForm
                  step={step.key} role={user.role}
                  onComplete={() => {
                    if (step.key === 'email') verifyEmail()
                    if (step.key === 'phone') verifyPhone()
                    if (step.key === 'bvn_nin') verifyBvnNin()
                    if (step.key === 'selfie') verifySelfie()
                    if (step.key === 'role_docs') verifyRoleDocs()
                    setActive(null)
                    toast(`${step.label} verified ✓`)
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600 to-ink-600 p-5 text-white">
          <div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6" /><h3 className="font-bold">You’re fully verified! 🎉</h3></div>
          <p className="mt-1 text-sm text-white/80">Your verification badge is now active. You can list properties, book inspections and transact securely.</p>
          <button onClick={() => navigate('/')} className="btn mt-4 w-full bg-white text-brand-700 hover:bg-white/90">Explore homes</button>
        </div>
      )}
    </div>
  )
}

function StepForm({ step, role, onComplete }: { step: StepKey; role: string; onComplete: () => void }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  function run(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onComplete() }, 900) // simulate provider call
  }

  if (step === 'email')
    return (
      <form onSubmit={run} className="space-y-3">
        <p className="text-sm text-slate-600">We sent a confirmation link to your email. Tap below to simulate confirming it.</p>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Confirming…' : 'Confirm email'}</button>
      </form>
    )

  if (step === 'phone')
    return (
      <form onSubmit={run} className="space-y-3">
        <label className="label">Enter the 6-digit OTP sent to your phone</label>
        <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="• • • • • •" className="input text-center text-lg tracking-[0.5em]" />
        <p className="text-xs text-slate-400">Demo OTP: any 6 digits (e.g. 123456)</p>
        <button className="btn-primary w-full" disabled={loading || value.length < 6}>{loading ? 'Verifying…' : 'Verify OTP'}</button>
      </form>
    )

  if (step === 'bvn_nin')
    return (
      <form onSubmit={run} className="space-y-3">
        <label className="label">Enter your BVN or NIN</label>
        <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" placeholder="11-digit BVN / NIN" className="input" />
        <p className="text-xs text-slate-400">🔒 Simulated check against NIBSS/NIMC. We never store your raw BVN/NIN.</p>
        <button className="btn-primary w-full" disabled={loading || value.length < 10}>{loading ? 'Verifying identity…' : 'Verify identity'}</button>
      </form>
    )

  if (step === 'selfie')
    return (
      <form onSubmit={run} className="space-y-3">
        <div className="grid h-40 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
          <div>
            <CameraIcon className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-1 text-sm text-slate-500">Position your face in the frame</p>
            <p className="text-xs text-slate-400">Liveness check placeholder</p>
          </div>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Analysing…' : 'Capture & verify selfie'}</button>
      </form>
    )

  // role_docs
  return (
    <form onSubmit={run} className="space-y-3">
      <label className="label">{role === 'landlord' ? 'Upload C of O / Deed of assignment' : 'Upload agent license & office proof'}</label>
      <div className="grid h-28 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
        <span><DocIcon className="mx-auto mb-1 h-7 w-7 text-slate-400" />Tap to upload document (PDF / image)</span>
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? 'Submitting…' : 'Submit for review'}</button>
    </form>
  )
}
