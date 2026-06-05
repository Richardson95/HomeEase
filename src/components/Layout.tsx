import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { Logo } from './Logo'
import { Avatar } from './Avatar'
import { HomeIcon, SearchIcon, HeartIcon, ChatIcon, UserIcon, BellIcon, PlusIcon } from './icons'
import { classNames, canList } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/search', label: 'Search', Icon: SearchIcon },
  { to: '/saved', label: 'Saved', Icon: HeartIcon },
  { to: '/messages', label: 'Messages', Icon: ChatIcon },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
]

export function Layout() {
  const user = useStore((s) => s.currentUser())
  const navigate = useNavigate()
  const unreadMsgs = useStore((s) =>
    user ? s.messages.filter((m) => s.threads.find((t) => t.id === m.threadId)?.participantIds.includes(user.id) && m.senderId !== user.id && !m.readBy.includes(user.id)).length : 0,
  )
  const unreadNotifs = useStore((s) => (user ? s.notifications.filter((n) => n.userId === user.id && !n.read).length : 0))
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-900/[0.06] bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <div className="container-wide flex h-16 items-center justify-between gap-3">
          <Link to="/" aria-label="HomeEase home"><Logo /></Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  classNames('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100')
                }
              >
                <Icon className="h-[18px] w-[18px]" />{label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {user && canList(user) && (
              <button onClick={() => navigate('/list-property')} className="btn-primary hidden h-9 px-3 sm:inline-flex">
                <PlusIcon className="h-4 w-4" /> List property
              </button>
            )}
            {user ? (
              <>
                <button onClick={() => navigate('/notifications')} aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100">
                  <BellIcon className="h-[22px] w-[22px]" />
                  {unreadNotifs > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadNotifs}</span>}
                </button>
                <button onClick={() => navigate('/profile')} aria-label="Profile"><Avatar name={user.name} src={user.avatarUrl} size={36} /></button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="btn-ghost h-9">Sign in</Link>
                <Link to="/auth/signup" className="btn-primary h-9">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main key={location.pathname} className="animate-fade-in pb-24 pt-5 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/[0.06] bg-white/85 shadow-nav backdrop-blur-xl md:hidden" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <div className="mx-auto grid max-w-2xl grid-cols-5 px-2 pt-1.5 pb-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                classNames('group relative flex flex-col items-center gap-1 py-1.5 text-[11px] font-semibold transition',
                  isActive ? 'text-brand-700' : 'text-slate-400')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={classNames('relative grid h-9 w-12 place-items-center rounded-full transition-all duration-300',
                    isActive ? 'bg-brand-50' : 'bg-transparent group-active:bg-slate-100')}>
                    <Icon className={classNames('h-[22px] w-[22px] transition', isActive && 'stroke-[2.2]')} />
                    {to === '/messages' && unreadMsgs > 0 && (
                      <span className="absolute right-1.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadMsgs}</span>
                    )}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
