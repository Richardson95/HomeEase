import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { DEMO_ACCOUNTS } from '@/data/mockData'

export default function Login() {
  const login = useStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const from = (location.state as { from?: string })?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = login(email, password)
    if (!res.ok) return setError(res.error || 'Login failed')
    toast('Welcome back to HomeEase 👋')
    navigate(from, { replace: true })
  }

  function demo(demoEmail: string) {
    login(demoEmail, 'demo')
    toast('Signed in to demo account')
    navigate('/', { replace: true })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your house hunt."
      footer={<>New to HomeEase? <Link to="/auth/signup" className="font-semibold text-brand-700">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} className="input" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link to="/auth/forgot" className="text-xs font-medium text-brand-700">Forgot password?</Link>
          </div>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" autoComplete="current-password" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">Sign in</button>
      </form>

      <div className="mt-6">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">Try a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((d) => (
            <button key={d.email} onClick={() => demo(d.email)} className="btn-secondary justify-start text-left">
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{d.name}</span>
                <span className="text-xs text-slate-500">{d.role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}
