import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { Avatar } from '@/components/Avatar'
import { VerifiedBadge } from '@/components/Badge'
import { PageHeader } from '@/components/common'
import {
  ShieldCheck, CalendarIcon, WalletIcon, TrendingIcon, HeartIcon, HomeIcon,
  UsersIcon, ChevronRight, LogoutIcon, StarIcon, PlusIcon,
} from '@/components/icons'
import { canList, classNames } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function Profile() {
  const user = useStore((s) => s.currentUser())!
  const logout = useStore((s) => s.logout)
  const myListings = useStore((s) => s.properties.filter((p) => p.ownerId === user.id))
  const navigate = useNavigate()
  const toast = useToast()

  const verified = user.verificationLevel === 'fully_verified'

  return (
    <div className="container-app">
      <PageHeader title="Profile" back={false} />

      {/* Identity card */}
      <div className="card overflow-hidden">
        <div className="relative h-20 bg-gradient-to-r from-ink-700 to-brand-600" />
        <div className="px-5 pb-5">
          <div className="-mt-9 flex items-end justify-between">
            <Avatar name={user.name} src={user.avatarUrl} size={72} className="ring-4 ring-white" />
            <span className="mb-1 chip bg-amber-50 text-amber-700"><StarIcon className="h-3.5 w-3.5" /> {(user.trustScore / 20).toFixed(1)} · Trust {user.trustScore}</span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900">{user.name}</h2>
          <p className="text-sm capitalize text-slate-500">{user.role} · {user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.badges.length ? user.badges.map((b) => <VerifiedBadge key={b} type={b} size="xs" />) : <span className="chip bg-slate-100 text-slate-500">Unverified</span>}
          </div>
        </div>
      </div>

      {/* Verification CTA */}
      {!verified && (
        <Link to="/auth/verify" className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 transition hover:bg-brand-100">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><ShieldCheck className="h-6 w-6" /></span>
          <div className="flex-1"><p className="font-semibold text-brand-900">Complete verification</p><p className="text-sm text-brand-700">Unlock listing, booking & escrow.</p></div>
          <ChevronRight className="h-5 w-5 text-brand-700" />
        </Link>
      )}

      {/* Owner: my listings summary */}
      {(user.role === 'landlord' || user.role === 'agent') && (
        <div className="mt-4 card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">My listings ({myListings.length})</h3>
            {canList(user) && <button onClick={() => navigate('/list-property')} className="btn-primary h-9"><PlusIcon className="h-4 w-4" /> New</button>}
          </div>
          {myListings.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{canList(user) ? 'You haven’t listed any property yet.' : 'Verify your account to start listing.'}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {myListings.map((p) => (
                <Link key={p.id} to={`/listing/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
                  <img src={p.images[0]} alt="" className="h-11 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{p.title}</p><p className="text-xs capitalize text-slate-400">{p.status.replace('_', ' ')}</p></div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
        <MenuItem Icon={CalendarIcon} label="My inspections" to="/inspections" />
        <MenuItem Icon={WalletIcon} label="Escrow wallet" to="/wallet" />
        <MenuItem Icon={TrendingIcon} label="Rent Assurance (loans)" to="/loans" />
        <MenuItem Icon={HeartIcon} label="Saved listings" to="/saved" />
        {user.role === 'admin' && <MenuItem Icon={UsersIcon} label="Admin dashboard" to="/admin" highlight />}
      </div>

      <button onClick={() => { logout(); toast('Signed out'); navigate('/') }} className="btn-secondary mt-4 w-full text-red-600">
        <LogoutIcon className="h-5 w-5" /> Sign out
      </button>
      <p className="mt-4 text-center text-xs text-slate-400">HomeEase v1.0 · Built for Lagos 🇳🇬</p>
    </div>
  )
}

function MenuItem({ Icon, label, to, highlight }: { Icon: typeof HomeIcon; label: string; to: string; highlight?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-slate-50 px-4 py-3.5 last:border-0 hover:bg-slate-50">
      <span className={classNames('grid h-9 w-9 place-items-center rounded-lg', highlight ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600')}><Icon className="h-5 w-5" /></span>
      <span className={classNames('flex-1 font-medium', highlight ? 'text-ink-700' : 'text-slate-700')}>{label}</span>
      <ChevronRight className="h-5 w-5 text-slate-300" />
    </Link>
  )
}
