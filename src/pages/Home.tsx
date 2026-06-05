import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { ListingCard } from '@/components/ListingCard'
import { SectionTitle } from '@/components/common'
import { SearchIcon, ShieldCheck, CalendarIcon, WalletIcon, TrendingIcon, PlusIcon } from '@/components/icons'
import { canList, classNames } from '@/lib/utils'
import { LAGOS_AREAS } from '@/lib/utils'

export default function Home() {
  const navigate = useNavigate()
  const user = useStore((s) => s.currentUser())
  const setFilters = useStore((s) => s.setFilters)
  const properties = useStore((s) => s.properties)

  const published = properties.filter((p) => p.status === 'published')
  const featured = published.filter((p) => p.featured)
  const recent = published.filter((p) => !p.featured).slice(0, 6)

  function quickSearch(area: string) {
    setFilters({ query: area, lga: undefined })
    navigate('/search')
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="container-wide">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-ink-900 via-ink-900 to-[#062b1d] px-6 py-12 text-white shadow-glow sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:36px_36px] opacity-60" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 animate-float rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

          <div className="relative max-w-xl">
            <span className="chip border border-white/15 bg-white/10 text-brand-300 backdrop-blur"><ShieldCheck className="h-3.5 w-3.5" /> Every home &amp; person verified</span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[2.7rem]">
              Find a home in Lagos<br className="hidden sm:block" /> you can <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">actually trust.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">No fake agents. No lost deposits. Verified listings, escrow-protected payments and instant inspection booking.</p>

            <button
              onClick={() => navigate('/search')}
              className="group mt-7 flex w-full items-center gap-3 rounded-2xl bg-white p-1.5 pl-4 text-left text-slate-500 shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl"
            >
              <SearchIcon className="h-5 w-5 text-brand-600" />
              <span className="flex-1 text-sm">Search by area, e.g. “Lekki Phase 1”…</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand transition group-hover:scale-105">
                <SearchIcon className="h-5 w-5" />
              </span>
            </button>

            <div className="mt-4 flex flex-wrap gap-2">
              {LAGOS_AREAS.slice(0, 5).map((a) => (
                <button key={a} onClick={() => quickSearch(a)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 backdrop-blur transition hover:border-white/20 hover:bg-white/15">{a}</button>
              ))}
            </div>
          </div>

          {/* Trust stats */}
          <div className="relative mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:gap-8">
            {[
              { n: '100%', l: 'Verified listings' },
              { n: '₦0', l: 'Lost to fraud' },
              { n: '<5min', l: 'To book a viewing' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.n}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/50 sm:text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-aware quick actions */}
      <section className="container-wide">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction Icon={SearchIcon} label="Browse homes" tone="brand" onClick={() => navigate('/search')} />
          <QuickAction Icon={CalendarIcon} label="My inspections" onClick={() => navigate(user ? '/inspections' : '/auth/login')} />
          <QuickAction Icon={WalletIcon} label="Escrow wallet" onClick={() => navigate(user ? '/wallet' : '/auth/login')} />
          {user && canList(user) ? (
            <QuickAction Icon={PlusIcon} label="List a property" tone="ink" onClick={() => navigate('/list-property')} />
          ) : (
            <QuickAction Icon={TrendingIcon} label="Rent Assurance" tone="ink" onClick={() => navigate(user ? '/loans' : '/auth/login')} />
          )}
        </div>
      </section>

      {/* Verification nudge */}
      {user && user.verificationLevel === 'unverified' && (
        <section className="container-wide">
          <Link to="/auth/verify" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-amber-950"><ShieldCheck className="h-6 w-6" /></span>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Verify your account to unlock everything</p>
              <p className="text-sm text-amber-700">Booking, listing and payments need a verified profile.</p>
            </div>
            <span className="text-amber-700">→</span>
          </Link>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-wide">
          <SectionTitle action={<Link to="/search" className="text-sm font-semibold text-brand-700">See all</Link>}>✨ Featured homes</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ListingCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="container-wide">
        <SectionTitle action={<Link to="/search" className="text-sm font-semibold text-brand-700">See all</Link>}>Recently verified</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => <ListingCard key={p.id} property={p} />)}
        </div>
      </section>

      {/* Trust band */}
      <section className="container-wide">
        <div className="grid gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-900/[0.04] sm:grid-cols-3 sm:p-8">
          {[
            { t: 'Triple-party verification', d: 'BVN/NIN, ownership docs & physical inspection.' },
            { t: 'Escrow-protected rent', d: 'Funds released only after you confirm move-in.' },
            { t: 'In-platform disputes', d: '7-day window with HomeEase mediation.' },
          ].map((x) => (
            <div key={x.t} className="flex gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand"><ShieldCheck className="h-6 w-6" /></span>
              <div><p className="font-bold text-slate-800">{x.t}</p><p className="mt-0.5 text-sm leading-relaxed text-slate-500">{x.d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function QuickAction({ Icon, label, onClick, tone = 'default' }: { Icon: typeof SearchIcon; label: string; onClick: () => void; tone?: 'default' | 'brand' | 'ink' }) {
  return (
    <button
      onClick={onClick}
      className={classNames('group flex flex-col items-start gap-3 rounded-2xl p-4 text-left shadow-soft ring-1 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]',
        tone === 'brand' && 'bg-gradient-to-br from-brand-50 to-white ring-brand-100 hover:shadow-card',
        tone === 'ink' && 'bg-gradient-to-br from-ink-900 to-ink-700 text-white ring-ink-900 hover:shadow-glow',
        tone === 'default' && 'bg-white ring-slate-900/[0.04] hover:shadow-card')}
    >
      <span className={classNames('grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-105',
        tone === 'brand' && 'bg-brand-100 text-brand-700',
        tone === 'ink' && 'bg-white/10 text-brand-300',
        tone === 'default' && 'bg-slate-100 text-slate-700')}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  )
}
