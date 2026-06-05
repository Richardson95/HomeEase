import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader, EmptyState } from '@/components/common'
import { CalendarIcon, PinIcon, CheckIcon, XIcon } from '@/components/icons'
import { classNames, formatDate } from '@/lib/utils'
import type { Inspection } from '@/types'

export default function Inspections() {
  const user = useStore((s) => s.currentUser())!
  const inspections = useStore((s) => s.inspections)
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')

  // A user sees inspections where they are tenant OR host (landlord/agent).
  const mine = inspections.filter((i) => i.tenantId === user.id || i.hostId === user.id)
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = mine.filter((i) => i.date >= today && ['pending', 'confirmed', 'rescheduled'].includes(i.status))
  const history = mine.filter((i) => i.date < today || ['completed', 'cancelled'].includes(i.status))
  const list = tab === 'upcoming' ? upcoming : history

  return (
    <div className="container-app">
      <PageHeader title="Inspections" subtitle="Manage your property viewings" back={false} />

      <div className="segment mb-4">
        {(['upcoming', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={classNames('segment-btn capitalize', tab === t ? 'segment-btn-active' : 'segment-btn-idle')}>
            {t} {t === 'upcoming' && upcoming.length > 0 && <span className="ml-1 text-brand-600">{upcoming.length}</span>}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<CalendarIcon className="h-7 w-7" />} title={tab === 'upcoming' ? 'No upcoming inspections' : 'No past inspections'} body="Browse verified homes and book a viewing in under a minute." action={<Link to="/search" className="btn-primary">Find a home</Link>} />
      ) : (
        <div className="space-y-3">{list.map((i) => <InspectionRow key={i.id} inspection={i} isHost={i.hostId === user.id} />)}</div>
      )}
    </div>
  )
}

function InspectionRow({ inspection, isHost }: { inspection: Inspection; isHost: boolean }) {
  const property = useStore((s) => s.properties.find((p) => p.id === inspection.propertyId))
  const other = useStore((s) => s.users.find((u) => u.id === (isHost ? inspection.tenantId : inspection.hostId)))
  const updateInspection = useStore((s) => s.updateInspection)
  const toast = useToast()
  const navigate = useNavigate()
  const [rescheduling, setRescheduling] = useState(false)

  if (!property) return null

  const statusTone: Record<string, string> = {
    confirmed: 'bg-brand-50 text-brand-700', pending: 'bg-amber-50 text-amber-700',
    completed: 'bg-slate-100 text-slate-600', cancelled: 'bg-red-50 text-red-600', rescheduled: 'bg-ink-500/10 text-ink-700',
  }
  const isPast = inspection.status === 'completed' || inspection.status === 'cancelled'

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-3 p-3">
        <Link to={`/listing/${property.id}`} className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img src={property.images[0]} alt="" className="h-full w-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/listing/${property.id}`} className="line-clamp-1 font-semibold text-slate-800">{property.title}</Link>
            <span className={classNames('chip capitalize', statusTone[inspection.status])}>{inspection.status}</span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500"><PinIcon className="h-4 w-4" />{property.location}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700"><CalendarIcon className="h-4 w-4 text-brand-600" />{formatDate(inspection.date)} · {inspection.time}</p>
          {other && <p className="mt-0.5 text-xs text-slate-400">{isHost ? 'Tenant' : property.ownerType === 'agent' ? 'Agent' : 'Owner'}: {other.name}</p>}
        </div>
      </div>

      {!isPast && (
        <div className="flex gap-2 border-t border-slate-100 p-2.5">
          {isHost && inspection.status === 'pending' && (
            <button onClick={() => { updateInspection(inspection.id, { status: 'confirmed' }); toast('Inspection approved') }} className="btn-primary h-9 flex-1"><CheckIcon className="h-4 w-4" /> Approve</button>
          )}
          <button onClick={() => navigate(`/listing/${property.id}`)} className="btn-ghost h-9 flex-1">View home</button>
          {rescheduling ? (
            <RescheduleInline onPick={(date, time) => { updateInspection(inspection.id, { date, time, status: 'confirmed' }); setRescheduling(false); toast('Inspection rescheduled') }} onCancel={() => setRescheduling(false)} />
          ) : (
            <>
              <button onClick={() => setRescheduling(true)} className="btn-secondary h-9 flex-1">Reschedule</button>
              <button onClick={() => { updateInspection(inspection.id, { status: 'cancelled' }); toast('Inspection cancelled', 'info') }} className="btn h-9 flex-1 text-red-600 hover:bg-red-50"><XIcon className="h-4 w-4" /> Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function RescheduleInline({ onPick, onCancel }: { onPick: (date: string, time: string) => void; onCancel: () => void }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const min = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <input type="date" min={min} value={date} onChange={(e) => setDate(e.target.value)} className="input h-9 py-1" />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input h-9 py-1" />
      <button disabled={!date || !time} onClick={() => onPick(date, time)} className="btn-primary h-9">Save</button>
      <button onClick={onCancel} className="btn-ghost h-9">Cancel</button>
    </div>
  )
}
