import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { XIcon, CalendarIcon, CheckIcon } from '@/components/icons'
import { classNames, formatDate } from '@/lib/utils'

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

/** Airbnb-style date+time picker. Prevents double-booking via the store. */
export function BookInspectionModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const bookInspection = useStore((s) => s.bookInspection)
  const inspections = useStore((s) => s.inspections)
  const toast = useToast()
  const navigate = useNavigate()

  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [error, setError] = useState('')

  // Next 14 selectable days
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().slice(0, 10)
  }), [])

  const takenTimes = useMemo(
    () => new Set(inspections.filter((i) => i.propertyId === propertyId && i.date === date && i.status !== 'cancelled').map((i) => i.time)),
    [inspections, propertyId, date],
  )

  function confirm() {
    if (!date || !time) { setError('Please pick a date and time.'); return }
    const res = bookInspection(propertyId, date, time)
    if (!res.ok) { setError(res.error || 'Could not book.'); return }
    toast('Inspection confirmed instantly ✓')
    onClose()
    navigate('/inspections')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarIcon className="h-5 w-5 text-brand-600" /> Book inspection</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><XIcon className="h-5 w-5" /></button>
        </div>

        <p className="mb-2 text-sm font-semibold text-slate-700">Select a date</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const dt = new Date(d)
            const active = date === d
            return (
              <button key={d} onClick={() => { setDate(d); setTime(''); setError('') }}
                className={classNames('flex w-14 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition',
                  active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                <span className="text-[11px] font-medium uppercase">{dt.toLocaleDateString('en-NG', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{dt.getDate()}</span>
                <span className="text-[11px]">{dt.toLocaleDateString('en-NG', { month: 'short' })}</span>
              </button>
            )
          })}
        </div>

        {date && (
          <>
            <p className="mb-2 mt-4 text-sm font-semibold text-slate-700">Available times</p>
            <div className="grid grid-cols-4 gap-2">
              {TIMES.map((t) => {
                const taken = takenTimes.has(t)
                const active = time === t
                return (
                  <button key={t} disabled={taken} onClick={() => { setTime(t); setError('') }}
                    className={classNames('rounded-xl border py-2 text-sm font-medium transition',
                      taken ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through' :
                      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                    {t}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {date && time && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
            <CheckIcon className="h-4 w-4" /> {formatDate(date)} at {time} — confirmation is instant
          </div>
        )}

        <button onClick={confirm} disabled={!date || !time} className="btn-primary mt-4 w-full">Confirm booking</button>
        <p className="mt-2 text-center text-xs text-slate-400">You can reschedule or cancel anytime before the date.</p>
      </div>
    </div>
  )
}
