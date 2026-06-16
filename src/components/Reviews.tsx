import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from './Toast'
import { Avatar } from './Avatar'
import { Stars, StarInput } from './Stars'
import { XIcon, ShieldCheck, StarIcon } from './icons'
import { timeAgo } from '@/lib/utils'

/** Aggregate rating header: big average + star row + count. */
export function RatingSummary({ subjectId }: { subjectId: string }) {
  const { avg, count } = useStore((s) => s.ratingFor(subjectId))
  if (!count) return <p className="text-sm text-slate-500">No reviews yet — be the first to share your experience.</p>
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-extrabold tracking-tight text-slate-900">{avg.toFixed(1)}</span>
      <div>
        <Stars value={avg} size={18} />
        <p className="mt-0.5 text-xs text-slate-500">{count} review{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}

/** Inline rating pill (for owner cards / profile chips). */
export function RatingPill({ subjectId }: { subjectId: string }) {
  const { avg, count } = useStore((s) => s.ratingFor(subjectId))
  return (
    <span className="chip bg-amber-50 text-amber-700">
      <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
      {count ? `${avg.toFixed(1)} · ${count}` : 'New'}
    </span>
  )
}

export function ReviewList({ subjectId, emptyHint }: { subjectId: string; emptyHint?: string }) {
  const reviews = useStore((s) => s.reviewsFor(subjectId))
  const users = useStore((s) => s.users)
  const me = useStore((s) => s.currentUser())
  const deleteReview = useStore((s) => s.deleteReview)
  const toast = useToast()

  if (!reviews.length) return <p className="text-sm text-slate-500">{emptyHint || 'No reviews yet.'}</p>

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const author = users.find((u) => u.id === r.authorId)
        return (
          <div key={r.id} className="card p-4">
            <div className="flex items-start gap-3">
              <Avatar name={author?.name || 'User'} src={author?.avatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800">{author?.name || 'HomeEase user'}</p>
                  {r.verifiedInteraction && (
                    <span className="chip bg-brand-50 text-brand-700"><ShieldCheck className="h-3 w-3" /> Verified tenant</span>
                  )}
                  <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                </div>
                <Stars value={r.rating} size={14} className="mt-1" />
                {r.comment && <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.comment}</p>}
                {me?.id === r.authorId && (
                  <button
                    onClick={() => { deleteReview(r.id); toast('Review deleted') }}
                    className="mt-2 text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ReviewModal({ subjectId, subjectName, propertyId, onClose }: { subjectId: string; subjectName: string; propertyId?: string; onClose: () => void }) {
  const addReview = useStore((s) => s.addReview)
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  function submit() {
    const res = addReview({ subjectId, propertyId, rating, comment })
    if (!res.ok) { setError(res.error || 'Could not submit review.'); return }
    toast('Thanks! Your review is live ✓')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Review {subjectName}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><XIcon className="h-5 w-5" /></button>
        </div>

        <p className="mb-2 text-sm font-semibold text-slate-700">Your rating</p>
        <StarInput value={rating} onChange={(v) => { setRating(v); setError('') }} />

        <p className="mb-2 mt-4 text-sm font-semibold text-slate-700">Your experience <span className="font-normal text-slate-400">(optional)</span></p>
        <textarea
          className="input min-h-[100px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Was the listing accurate? Were they responsive and honest? Help other tenants decide…"
        />

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button onClick={submit} className="btn-primary mt-4 w-full">Post review</button>
        <p className="mt-2 text-center text-xs text-slate-400">Reviews are public and tied to your verified profile.</p>
      </div>
    </div>
  )
}
