import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, EmptyState } from '@/components/common'
import { BellIcon, CalendarIcon, ChatIcon, WalletIcon, TrendingIcon, AlertIcon, ShieldCheck } from '@/components/icons'
import { timeAgo, classNames } from '@/lib/utils'
import type { NotificationType } from '@/types'

const ICONS: Record<NotificationType, { Icon: typeof BellIcon; tone: string }> = {
  inspection: { Icon: CalendarIcon, tone: 'bg-brand-50 text-brand-600' },
  message: { Icon: ChatIcon, tone: 'bg-ink-500/10 text-ink-600' },
  escrow: { Icon: WalletIcon, tone: 'bg-emerald-50 text-emerald-600' },
  loan: { Icon: TrendingIcon, tone: 'bg-amber-50 text-amber-600' },
  fraud: { Icon: AlertIcon, tone: 'bg-red-50 text-red-600' },
  verification: { Icon: ShieldCheck, tone: 'bg-brand-50 text-brand-600' },
  system: { Icon: BellIcon, tone: 'bg-slate-100 text-slate-500' },
}

export default function Notifications() {
  const user = useStore((s) => s.currentUser())!
  const notifications = useStore((s) => s.notifications.filter((n) => n.userId === user.id))
  const markRead = useStore((s) => s.markNotificationsRead)

  useEffect(() => { const t = setTimeout(markRead, 800); return () => clearTimeout(t) }, [markRead])

  return (
    <div className="container-app">
      <PageHeader title="Notifications" />
      {notifications.length === 0 ? (
        <EmptyState icon={<BellIcon className="h-7 w-7" />} title="You’re all caught up" body="Updates about inspections, escrow and messages will show here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { Icon, tone } = ICONS[n.type]
            return (
              <div key={n.id} className={classNames('flex gap-3 rounded-2xl p-3.5 ring-1', n.read ? 'bg-white ring-slate-100' : 'bg-brand-50/50 ring-brand-100')}>
                <span className={classNames('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tone)}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="text-sm text-slate-600">{n.body}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
