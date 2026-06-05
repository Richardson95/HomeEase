import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { CheckIcon } from '@/components/icons'

export default function Forgot() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={sent ? undefined : 'Enter your email and we’ll send you a reset link.'}
      footer={<>Remembered it? <Link to="/auth/login" className="font-semibold text-brand-700">Back to sign in</Link></>}
    >
      {sent ? (
        <div className="rounded-2xl bg-brand-50 p-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white"><CheckIcon className="h-7 w-7" /></div>
          <p className="text-sm text-slate-600">If an account exists for <span className="font-semibold text-slate-800">{email}</span>, a password reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn-primary w-full">Send reset link</button>
        </form>
      )}
    </AuthShell>
  )
}
