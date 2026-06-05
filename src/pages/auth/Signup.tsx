import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import type { Role } from '@/types'
import { classNames } from '@/lib/utils'
import { UserIcon, HomeIcon, UsersIcon } from '@/components/icons'

const ROLES: { value: Role; label: string; desc: string; Icon: typeof UserIcon }[] = [
  { value: 'tenant', label: 'Tenant', desc: 'I want to find & rent a home', Icon: UserIcon },
  { value: 'landlord', label: 'Landlord', desc: 'I own property to rent out', Icon: HomeIcon },
  { value: 'agent', label: 'Agent', desc: 'I manage listings for clients', Icon: UsersIcon },
]

export default function Signup() {
  const signup = useStore((s) => s.signup)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [role, setRole] = useState<Role>('tenant')
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [k]: e.target.value }); setError('') }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = signup({ name: form.name, email: form.email, phone: form.phone, role })
    if (!res.ok) return setError(res.error || 'Could not create account')
    toast('Account created — let’s verify you 🔐')
    navigate('/auth/verify', { replace: true })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Lagos' verified rental community in minutes."
      footer={<>Already have an account? <Link to="/auth/login" className="font-semibold text-brand-700">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">I am a…</span>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ value, label, Icon }) => (
              <button
                key={value} type="button" onClick={() => setRole(value)}
                className={classNames('flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition',
                  role === value ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50')}
              >
                <Icon className={classNames('h-6 w-6', role === value ? 'text-brand-600' : 'text-slate-400')} />
                <span className={classNames('text-xs font-semibold', role === value ? 'text-brand-700' : 'text-slate-600')}>{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{ROLES.find((r) => r.value === role)?.desc}</p>
        </div>

        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" required value={form.name} onChange={set('name')} className="input" placeholder="e.g. Tunde Bakare" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" type="tel" required value={form.phone} onChange={set('phone')} className="input" placeholder="+234 801 234 5678" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required value={form.password} onChange={set('password')} className="input" placeholder="Create a strong password" />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">Create account</button>
        <p className="text-center text-xs text-slate-400">By continuing you agree to HomeEase’s Terms & Privacy Policy.</p>
      </form>
    </AuthShell>
  )
}
