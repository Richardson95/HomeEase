import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { PageHeader } from '@/components/common'
import { PlanPicker } from '@/components/PlanPicker'
import { ShieldCheck, CheckIcon, AlertIcon, CameraIcon } from '@/components/icons'
import { AMENITIES, LAGOS_AREAS, PROPERTY_TYPE_LABEL, canList, classNames, formatNaira, planByTier } from '@/lib/utils'
import type { PropertyType, FurnishingStatus } from '@/types'

// Curated stock images the lister can pick from (stands in for an upload widget).
const STOCK = [
  '1502672260266-1c1ef2d93688', '1512917774080-9991f1c4c750', '1522708323590-d24dbb6b0267',
  '1560185007-cde436f6a4d0', '1493809842364-78817add7ffb', '1564013799919-ab600027ffc6',
  '1600596542815-ffad4c1539a9', '1505691938895-1758d7feb511', '1484154218962-a197022b5858',
].map((id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`)

const TYPES: PropertyType[] = ['self_contain', 'mini_flat', '2_bedroom', '3_bedroom', 'duplex', 'studio', 'shared']

export default function AddListing() {
  const user = useStore((s) => s.currentUser())!
  const addProperty = useStore((s) => s.addProperty)
  const activeSub = useStore((s) => s.activeSubscription(user.id))
  const remaining = useStore((s) => s.remainingListings(user.id))
  const toast = useToast()
  const navigate = useNavigate()

  const [f, setF] = useState({
    title: '', description: '', rent: 2_000_000, serviceCharge: 200_000,
    bedrooms: 2, bathrooms: 2, location: LAGOS_AREAS[0], lga: 'Eti-Osa',
    propertyType: '2_bedroom' as PropertyType, furnishing: 'unfurnished' as FurnishingStatus, petFriendly: false,
  })
  const [amenities, setAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([STOCK[0]])
  const [error, setError] = useState('')

  if (!canList(user)) {
    return (
      <div className="container-app">
        <PageHeader title="List a property" />
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600"><ShieldCheck className="h-7 w-7" /></div>
          <h2 className="font-bold text-slate-900">Verification required</h2>
          <p className="mt-1 text-sm text-slate-500">Only verified landlords and agents can list properties. Complete KYC and ownership/license verification to continue.</p>
          <Link to="/auth/verify" className="btn-primary mt-4 inline-flex">Verify my account</Link>
        </div>
      </div>
    )
  }

  // Verified, but needs an active plan with an available listing slot.
  if (remaining <= 0) {
    return (
      <div className="container-app pb-10">
        <PageHeader title="Choose a listing plan" subtitle={activeSub ? 'You’ve used all the listings on your current plan. Upgrade or renew to post more.' : 'Subscribe to a plan to start posting properties. Each plan includes a set number of listings.'} />
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <ShieldCheck className="h-5 w-5 shrink-0" /> Paid plans keep listings genuine — every poster is a verified, paying landlord or agent.
        </div>
        <PlanPicker />
      </div>
    )
  }

  const set = (k: keyof typeof f) => (v: any) => { setF({ ...f, [k]: v }); setError('') }
  const toggleAmenity = (a: string) => setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]))
  const toggleImage = (src: string) => setImages((cur) => (cur.includes(src) ? cur.filter((x) => x !== src) : [...cur, src]))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.title.trim() || f.description.trim().length < 20) { setError('Add a title and a description of at least 20 characters.'); return }
    if (images.length === 0) { setError('Select at least one photo.'); return }
    const { id, flagged } = addProperty({
      ownerId: user.id, ownerType: user.role === 'agent' ? 'agent' : 'landlord',
      title: f.title, description: f.description, rent: f.rent, serviceCharge: f.serviceCharge,
      bedrooms: f.bedrooms, bathrooms: f.bathrooms, location: f.location, lga: f.lga,
      propertyType: f.propertyType, amenities, furnishing: f.furnishing, petFriendly: f.petFriendly,
      images, videos: [],
    })
    if (flagged) {
      toast('Listing flagged by fraud detection — sent for manual review', 'error')
    } else {
      toast('Listing submitted! Field verification within 24h ✓')
    }
    navigate(`/listing/${id}`)
  }

  return (
    <div className="container-app pb-10">
      <PageHeader title="List a property" subtitle="Verified listings get a trust badge after field inspection" />

      {activeSub && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-brand-800">
            <CheckIcon className="h-4 w-4" />
            <span><span className="font-semibold capitalize">{planByTier(activeSub.tier).name}</span> plan · <span className="font-semibold">{remaining >= 999 ? 'Unlimited' : remaining}</span> listing{remaining !== 1 ? 's' : ''} left</span>
          </div>
          <span className="text-xs text-brand-700/70">Renews {new Date(activeSub.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* Photos */}
        <Section title="Photos" hint="Pick from our gallery (upload widget placeholder)">
          <div className="mb-2 grid grid-cols-3 gap-2">
            {STOCK.map((src) => {
              const idx = images.indexOf(src)
              return (
                <button type="button" key={src} onClick={() => toggleImage(src)} className={classNames('relative aspect-square overflow-hidden rounded-xl ring-2 transition', idx >= 0 ? 'ring-brand-500' : 'ring-transparent')}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {idx >= 0 && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{idx + 1}</span>}
                </button>
              )
            })}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-400"><CameraIcon className="h-4 w-4" /> Videos supported on production. {images.length} photo(s) selected.</p>
        </Section>

        {/* Basics */}
        <Section title="Property details">
          <Field label="Title"><input className="input" value={f.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Modern 2-Bedroom Flat in Lekki" /></Field>
          <Field label="Description"><textarea className="input min-h-[96px]" value={f.description} onChange={(e) => set('description')(e.target.value)} placeholder="Describe the property, finishing, neighbourhood…" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Annual rent — ${formatNaira(f.rent, { short: true })}`}><input type="number" className="input" value={f.rent} min={0} step={50000} onChange={(e) => set('rent')(Number(e.target.value))} /></Field>
            <Field label="Service charge"><input type="number" className="input" value={f.serviceCharge} min={0} step={10000} onChange={(e) => set('serviceCharge')(Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bedrooms"><input type="number" className="input" value={f.bedrooms} min={0} max={10} onChange={(e) => set('bedrooms')(Number(e.target.value))} /></Field>
            <Field label="Bathrooms"><input type="number" className="input" value={f.bathrooms} min={0} max={10} onChange={(e) => set('bathrooms')(Number(e.target.value))} /></Field>
          </div>
        </Section>

        {/* Location & type */}
        <Section title="Location & type">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><select className="input" value={f.location} onChange={(e) => set('location')(e.target.value)}>{LAGOS_AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <Field label="LGA"><input className="input" value={f.lga} onChange={(e) => set('lga')(e.target.value)} /></Field>
          </div>
          <Field label="Property type">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => <Pill key={t} active={f.propertyType === t} onClick={() => set('propertyType')(t)}>{PROPERTY_TYPE_LABEL[t]}</Pill>)}
            </div>
          </Field>
          <Field label="Furnishing">
            <div className="flex flex-wrap gap-2">
              {(['unfurnished', 'semi_furnished', 'furnished'] as FurnishingStatus[]).map((fu) => <Pill key={fu} active={f.furnishing === fu} onClick={() => set('furnishing')(fu)}>{fu.replace('_', '-')}</Pill>)}
            </div>
          </Field>
          <label className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">🐾 Pet-friendly</span>
            <input type="checkbox" checked={f.petFriendly} onChange={(e) => set('petFriendly')(e.target.checked)} className="h-5 w-5 accent-brand-600" />
          </label>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button type="button" key={a} onClick={() => toggleAmenity(a)} className={classNames('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition', amenities.includes(a) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                {amenities.includes(a) && <CheckIcon className="h-3.5 w-3.5" />}{a}
              </button>
            ))}
          </div>
        </Section>

        <div className="flex items-start gap-2 rounded-xl bg-ink-500/5 px-4 py-3 text-sm text-ink-700">
          <ShieldCheck className="h-5 w-5 shrink-0" /> On submit, our AI duplicate-detection screens this listing. Genuine listings are queued for 24h field verification.
        </div>

        {error && <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertIcon className="h-4 w-4" />{error}</p>}
        <button type="submit" className="btn-primary w-full">Submit for verification</button>
      </form>
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="font-bold text-slate-900">{title}</h3>
      {hint && <p className="mb-3 text-xs text-slate-400">{hint}</p>}
      <div className={classNames('space-y-3', !hint && 'mt-3')}>{children}</div>
    </div>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="label">{label}</span>{children}</div>
}
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={classNames('rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition', active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>{children}</button>
}
