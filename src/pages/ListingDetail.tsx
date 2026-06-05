import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { Avatar } from '@/components/Avatar'
import { VerifiedBadge, VerifiedPropertyTag, FeaturedTag } from '@/components/Badge'
import { BookInspectionModal } from './BookInspectionModal'
import { PageHeader, EmptyState } from '@/components/common'
import {
  BedIcon, BathIcon, PinIcon, HeartIcon, ShieldCheck, ChatIcon, CalendarIcon,
  WalletIcon, CheckIcon, ChevronLeft, ChevronRight, StarIcon,
} from '@/components/icons'
import { formatNaira, PROPERTY_TYPE_LABEL, FURNISHING_LABEL, classNames, canTransact } from '@/lib/utils'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const property = useStore((s) => s.properties.find((p) => p.id === id))
  const owner = useStore((s) => s.users.find((u) => u.id === property?.ownerId))
  const user = useStore((s) => s.currentUser())
  const isSaved = useStore((s) => (id ? s.isSaved(id) : false))
  const toggleSaved = useStore((s) => s.toggleSaved)
  const getOrCreateThread = useStore((s) => s.getOrCreateThread)
  const payToEscrow = useStore((s) => s.payToEscrow)

  const [imgIdx, setImgIdx] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)

  if (!property || !owner) {
    return <div className="container-app"><EmptyState title="Listing not found" body="This property may have been removed." action={<Link to="/search" className="btn-primary">Back to search</Link>} /></div>
  }

  function startChat() {
    if (!user) return navigate('/auth/login')
    const tid = getOrCreateThread(owner!.id, property!.id)
    navigate(`/messages/${tid}`)
  }

  function book() {
    if (!user) return navigate('/auth/login')
    if (!canTransact(user)) { toast('Verify your phone number to book inspections', 'error'); return navigate('/auth/verify') }
    setBookOpen(true)
  }

  function pay() {
    if (!user) return navigate('/auth/login')
    if (!canTransact(user)) { toast('Complete verification to pay via escrow', 'error'); return navigate('/auth/verify') }
    payToEscrow(property!.id, owner!.id, property!.rent + property!.serviceCharge)
    toast('Payment secured in escrow 🔒')
    navigate('/wallet')
  }

  const total = property.rent + property.serviceCharge

  return (
    <div className="container-wide pb-28 md:pb-10">
      <div className="md:hidden"><PageHeader title="" subtitle="" /></div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery + info */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[16/10]">
            <img src={property.images[imgIdx]} alt={property.title} className="h-full w-full object-cover" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {property.verifiedProperty && <VerifiedPropertyTag />}
              {property.featured && <FeaturedTag />}
            </div>
            <button onClick={() => user ? toggleSaved(property.id) : navigate('/auth/login')} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow backdrop-blur active:scale-90" aria-label="Save">
              <HeartIcon className={classNames('h-5 w-5', isSaved && 'fill-red-500 text-red-500')} />
            </button>
            {property.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + property.images.length) % property.images.length)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => setImgIdx((i) => (i + 1) % property.images.length)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {property.images.map((_, i) => <span key={i} className={classNames('h-1.5 rounded-full transition-all', i === imgIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50')} />)}
                </div>
              </>
            )}
          </div>
          {property.images.length > 1 && (
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {property.images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={classNames('h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition', i === imgIdx ? 'ring-brand-500' : 'ring-transparent')}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-slate-100 text-slate-600">{PROPERTY_TYPE_LABEL[property.propertyType]}</span>
              {property.trustedLandlord && <VerifiedBadge type="trusted" />}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{property.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-slate-500"><PinIcon className="h-5 w-5" />{property.location}, {property.lga} LGA</p>

            <div className="mt-4 flex flex-wrap gap-4 border-y border-slate-100 py-4 text-slate-700">
              <Fact Icon={BedIcon} label={`${property.bedrooms} Bedroom${property.bedrooms !== 1 ? 's' : ''}`} />
              <Fact Icon={BathIcon} label={`${property.bathrooms} Bathroom${property.bathrooms !== 1 ? 's' : ''}`} />
              <Fact Icon={ShieldCheck} label={FURNISHING_LABEL[property.furnishing]} />
              {property.petFriendly && <Fact Icon={CheckIcon} label="Pet-friendly" />}
            </div>

            <div className="mt-5">
              <h2 className="mb-1.5 font-bold text-slate-900">About this home</h2>
              <p className="leading-relaxed text-slate-600">{property.description}</p>
            </div>

            <div className="mt-5">
              <h2 className="mb-2 font-bold text-slate-900">Amenities</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"><CheckIcon className="h-4 w-4 text-brand-600" />{a}</span>
                ))}
              </div>
            </div>

            {/* Owner card */}
            <div className="mt-5 card flex items-center gap-3 p-4">
              <Avatar name={owner.name} src={owner.avatarUrl} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{owner.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {owner.badges.map((b) => <VerifiedBadge key={b} type={b} size="xs" />)}
                  <span className="chip bg-amber-50 text-amber-700"><StarIcon className="h-3 w-3" />{(owner.trustScore / 20).toFixed(1)}</span>
                </div>
              </div>
              <button onClick={startChat} className="btn-secondary"><ChatIcon className="h-4 w-4" /> Chat</button>
            </div>
          </div>
        </div>

        {/* Desktop sticky action panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <PriceCard property={property} total={total} onBook={book} onPay={pay} onChat={startChat} />
            <TrustNote />
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
        <div className="container-wide flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-slate-900">{formatNaira(property.rent, { short: true })}<span className="text-sm font-medium text-slate-400">/yr</span></p>
          </div>
          <button onClick={startChat} className="btn-secondary shrink-0"><ChatIcon className="h-5 w-5" /></button>
          <button onClick={book} className="btn-primary flex-1"><CalendarIcon className="h-5 w-5" /> Book inspection</button>
        </div>
      </div>

      {bookOpen && <BookInspectionModal propertyId={property.id} onClose={() => setBookOpen(false)} />}
    </div>
  )
}

function PriceCard({ property, total, onBook, onPay, onChat }: { property: any; total: number; onBook: () => void; onPay: () => void; onChat: () => void }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{formatNaira(property.rent)}</span>
        <span className="text-slate-400">/year</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Annual rent</dt><dd className="font-medium text-slate-800">{formatNaira(property.rent)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Service charge</dt><dd className="font-medium text-slate-800">{formatNaira(property.serviceCharge)}</dd></div>
        <div className="flex justify-between border-t border-slate-100 pt-1.5"><dt className="font-semibold text-slate-700">Total (yr 1)</dt><dd className="font-bold text-slate-900">{formatNaira(total)}</dd></div>
      </dl>
      <button onClick={onBook} className="btn-primary mt-4 w-full"><CalendarIcon className="h-5 w-5" /> Book inspection</button>
      <button onClick={onPay} className="btn-secondary mt-2 w-full"><WalletIcon className="h-5 w-5" /> Pay rent via escrow</button>
      <button onClick={onChat} className="btn-ghost mt-2 w-full"><ChatIcon className="h-5 w-5" /> Message {property.ownerType === 'agent' ? 'agent' : 'owner'}</button>
    </div>
  )
}
function TrustNote() {
  return (
    <div className="rounded-2xl bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-brand-800"><ShieldCheck className="h-5 w-5" /> Protected by HomeEase</p>
      <p className="mt-1 text-sm text-brand-700/80">Pay into escrow and funds are only released after you confirm move-in. 7-day dispute window included.</p>
    </div>
  )
}
function Fact({ Icon, label }: { Icon: typeof BedIcon; label: string }) {
  return <span className="inline-flex items-center gap-2 font-medium"><Icon className="h-5 w-5 text-slate-400" />{label}</span>
}
