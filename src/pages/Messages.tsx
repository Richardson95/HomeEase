import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { Avatar } from '@/components/Avatar'
import { PageHeader, EmptyState } from '@/components/common'
import { VerifiedBadge } from '@/components/Badge'
import { ChatIcon } from '@/components/icons'
import { timeAgo, classNames } from '@/lib/utils'

export default function Messages() {
  const user = useStore((s) => s.currentUser())!
  const threads = useStore((s) => s.threads)
  const messages = useStore((s) => s.messages)
  const users = useStore((s) => s.users)
  const properties = useStore((s) => s.properties)

  const myThreads = threads
    .filter((t) => t.participantIds.includes(user.id))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))

  return (
    <div className="container-app">
      <PageHeader title="Messages" subtitle="Chat with verified agents & landlords" back={false} />

      {myThreads.length === 0 ? (
        <EmptyState icon={<ChatIcon className="h-7 w-7" />} title="No conversations yet" body="Message an agent or owner from any listing to get started." action={<Link to="/search" className="btn-primary">Browse homes</Link>} />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
          {myThreads.map((t) => {
            const other = users.find((u) => u.id === t.participantIds.find((p) => p !== user.id))
            const threadMsgs = messages.filter((m) => m.threadId === t.id)
            const last = threadMsgs[threadMsgs.length - 1]
            const unread = threadMsgs.filter((m) => m.senderId !== user.id && !m.readBy.includes(user.id)).length
            const prop = t.propertyId ? properties.find((p) => p.id === t.propertyId) : undefined
            if (!other) return null
            return (
              <Link key={t.id} to={`/messages/${t.id}`} className="flex items-center gap-3 p-3.5 transition hover:bg-slate-50">
                <Avatar name={other.name} src={other.avatarUrl} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-800">{other.name}</p>
                    {last && <span className="shrink-0 text-xs text-slate-400">{timeAgo(last.createdAt)}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(other.role === 'agent' || other.role === 'landlord') && other.badges[0] && <VerifiedBadge type={other.badges[0]} size="xs" />}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={classNames('truncate text-sm', unread ? 'font-semibold text-slate-800' : 'text-slate-500')}>
                      {last ? (last.senderId === user.id ? 'You: ' : '') + (last.body || '📎 Attachment') : prop ? prop.title : 'Start chatting'}
                    </p>
                    {unread > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">{unread}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
