import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { Avatar } from '@/components/Avatar'
import { VerifiedBadge } from '@/components/Badge'
import { ChevronLeft, SendIcon, PaperclipIcon, CheckIcon, ShieldCheck } from '@/components/icons'
import { classNames, timeAgo, formatNaira } from '@/lib/utils'

const TEMPLATES = [
  { label: 'Request viewing', text: 'Hello, I’d like to schedule a viewing for this property. When are you available?' },
  { label: 'Negotiate rent', text: 'Is the rent negotiable? I’m a verified tenant and ready to proceed quickly.' },
  { label: 'Ask availability', text: 'Hi, is this property still available?' },
]

export default function ChatThread() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const user = useStore((s) => s.currentUser())!
  const thread = useStore((s) => s.threads.find((t) => t.id === threadId))
  const messages = useStore((s) => s.messages.filter((m) => m.threadId === threadId))
  const other = useStore((s) => s.users.find((u) => thread && u.id === thread.participantIds.find((p) => p !== user.id)))
  const property = useStore((s) => (thread?.propertyId ? s.properties.find((p) => p.id === thread.propertyId) : undefined))
  const sendMessage = useStore((s) => s.sendMessage)
  const markThreadRead = useStore((s) => s.markThreadRead)

  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (threadId) markThreadRead(threadId) }, [threadId, messages.length, markThreadRead])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  if (!thread || !other) { navigate('/messages'); return null }

  function send(body: string, propertyRef?: string) {
    if (!body.trim()) return
    sendMessage(thread!.id, body.trim(), propertyRef)
    setText('')
  }

  const isVerifiedPro = (other.role === 'agent' || other.role === 'landlord') && other.badges.length > 0

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-5rem)] w-full max-w-2xl flex-col md:h-[calc(100dvh-3.5rem-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-3 py-2.5">
        <button onClick={() => navigate('/messages')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><ChevronLeft className="h-6 w-6" /></button>
        <Avatar name={other.name} src={other.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800">{other.name}</p>
          {isVerifiedPro && <span className="text-xs text-brand-700">● {other.role === 'agent' ? 'Verified Agent' : 'Verified Landlord'}</span>}
        </div>
        {isVerifiedPro && <VerifiedBadge type={other.badges[0]} size="xs" />}
      </div>

      {/* Trust banner */}
      {isVerifiedPro && (
        <div className="flex items-center gap-2 bg-brand-50 px-4 py-1.5 text-xs text-brand-700">
          <ShieldCheck className="h-4 w-4" /> You’re chatting with a HomeEase-verified {other.role}. Never pay outside escrow.
        </div>
      )}

      {/* Property preview */}
      {property && (
        <Link to={`/listing/${property.id}`} className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5 hover:bg-slate-50">
          <img src={property.images[0]} alt="" className="h-12 w-14 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{property.title}</p>
            <p className="text-sm text-brand-700">{formatNaira(property.rent, { short: true })}/yr · {property.location}</p>
          </div>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
        {messages.map((m) => {
          const mine = m.senderId === user.id
          const readByOther = m.readBy.includes(other.id)
          return (
            <div key={m.id} className={classNames('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={classNames('max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                mine ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-white text-slate-800')}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <span className={classNames('mt-0.5 flex items-center justify-end gap-1 text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
                  {timeAgo(m.createdAt)}
                  {mine && <CheckIcon className={classNames('h-3 w-3', readByOther ? 'text-white' : 'text-white/50')} />}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Templates */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
        {TEMPLATES.map((t) => (
          <button key={t.label} onClick={() => send(t.text, property?.id)} className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">{t.label}</button>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={(e) => { e.preventDefault(); send(text, property?.id) }} className="flex items-center gap-2 border-t border-slate-100 bg-white p-2.5" style={{ paddingBottom: 'calc(0.625rem + var(--safe-bottom))' }}>
        <button type="button" onClick={() => send('📎 document.pdf shared (demo)', property?.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Attach"><PaperclipIcon className="h-5 w-5" /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="input flex-1 rounded-full" />
        <button type="submit" disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-40" aria-label="Send"><SendIcon className="h-5 w-5" /></button>
      </form>
    </div>
  )
}
