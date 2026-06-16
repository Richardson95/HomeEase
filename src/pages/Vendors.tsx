import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { Avatar } from '@/components/Avatar'
import { Stars } from '@/components/Stars'
import { PageHeader, EmptyState, SectionTitle } from '@/components/common'
import {
  SearchIcon, PhoneIcon, ChatIcon, ShieldCheck, PlusIcon, XIcon, CheckIcon, AlertIcon, PinIcon,
} from '@/components/icons'
import {
  VENDOR_CATEGORY_LABEL, VENDOR_CATEGORY_EMOJI, LAGOS_AREAS, formatNaira, classNames,
} from '@/lib/utils'
import type { Vendor, VendorCategory } from '@/types'

const CATEGORIES = Object.keys(VENDOR_CATEGORY_LABEL) as VendorCategory[]

export default function Vendors() {
  const vendors = useStore((s) => s.vendors)
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<VendorCategory | 'all'>('all')
  const [registerOpen, setRegisterOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vendors
      .filter((v) => (cat === 'all' || v.category === cat))
      .filter((v) => !q || v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q) || v.lga.toLowerCase().includes(q) || VENDOR_CATEGORY_LABEL[v.category].toLowerCase().includes(q))
      .sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating)
  }, [vendors, query, cat])

  return (
    <div className="container-wide pb-10">
      <PageHeader
        title="Maintenance & Vendors"
        subtitle="Vetted painters, plumbers, carpenters & more for your home"
        back={false}
        action={<button onClick={() => setRegisterOpen(true)} className="btn-primary hidden h-10 sm:inline-flex"><PlusIcon className="h-4 w-4" /> Become a vendor</button>}
      />

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-card ring-1 ring-slate-900/[0.04]">
        <SearchIcon className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by trade, name or area…"
          className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Category filter */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>All trades</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{VENDOR_CATEGORY_EMOJI[c]} {VENDOR_CATEGORY_LABEL[c]}</Chip>
        ))}
      </div>

      {/* Mobile CTA */}
      <button onClick={() => setRegisterOpen(true)} className="btn-primary mt-3 w-full sm:hidden"><PlusIcon className="h-4 w-4" /> Become a vendor</button>

      <div className="mt-5">
        <SectionTitle>{results.length} {cat === 'all' ? 'vendors' : VENDOR_CATEGORY_LABEL[cat].toLowerCase() + 's'} available</SectionTitle>
        {results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-7 w-7" />}
            title="No vendors found"
            body="Try another trade or area — or register a vendor you trust."
            action={<button onClick={() => setRegisterOpen(true)} className="btn-primary">Register a vendor</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>

      {registerOpen && <VendorRegisterModal onClose={() => setRegisterOpen(false)} />}
    </div>
  )
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const toast = useToast()
  const tel = vendor.phone.replace(/[^\d+]/g, '')
  const wa = (vendor.whatsapp || vendor.phone).replace(/[^\d]/g, '')

  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={vendor.name} src={vendor.avatarUrl} size={48} />
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-sm shadow ring-1 ring-slate-100">{VENDOR_CATEGORY_EMOJI[vendor.category]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold text-slate-900">{vendor.name}</p>
            {vendor.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />}
          </div>
          <p className="text-sm text-slate-500">{VENDOR_CATEGORY_LABEL[vendor.category]}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Stars value={vendor.rating} size={13} />
            <span className="text-xs text-slate-400">{vendor.rating.toFixed(1)} · {vendor.jobsCompleted} jobs</span>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{vendor.bio}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><PinIcon className="h-3.5 w-3.5" />{vendor.location}</span>
        <span>·</span>
        <span>{vendor.yearsExperience} yrs exp</span>
        {vendor.ratePerDay && <><span>·</span><span className="font-semibold text-slate-700">{formatNaira(vendor.ratePerDay)}/day</span></>}
      </div>

      <div className="mt-4 flex gap-2">
        <a href={`tel:${tel}`} onClick={() => toast(`Calling ${vendor.name}…`)} className="btn-secondary h-9 flex-1"><PhoneIcon className="h-4 w-4" /> Call</a>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-primary h-9 flex-1"><ChatIcon className="h-4 w-4" /> WhatsApp</a>
      </div>
    </div>
  )
}

function VendorRegisterModal({ onClose }: { onClose: () => void }) {
  const registerVendor = useStore((s) => s.registerVendor)
  const user = useStore((s) => s.currentUser())
  const toast = useToast()

  const [f, setF] = useState({
    name: user?.name || '', category: 'painter' as VendorCategory,
    phone: user?.phone || '', whatsapp: '', location: LAGOS_AREAS[0], lga: 'Eti-Osa',
    bio: '', yearsExperience: 3, ratePerDay: 15000,
  })
  const [error, setError] = useState('')
  const set = (k: keyof typeof f) => (v: any) => { setF({ ...f, [k]: v }); setError('') }

  function submit() {
    if (!f.name.trim()) { setError('Enter your business or full name.'); return }
    if (f.phone.replace(/[^\d]/g, '').length < 10) { setError('Enter a valid phone number.'); return }
    if (f.bio.trim().length < 20) { setError('Add a short description (at least 20 characters).'); return }
    registerVendor({
      name: f.name.trim(), category: f.category, phone: f.phone.trim(),
      whatsapp: f.whatsapp.trim() || undefined, location: f.location, lga: f.lga,
      bio: f.bio.trim(), yearsExperience: Number(f.yearsExperience), ratePerDay: Number(f.ratePerDay) || undefined,
    })
    toast('You’re listed! Verification within 48h ✓')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Become a vendor</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><XIcon className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Business / full name"><input className="input" value={f.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Bola Painting Works" /></Field>

          <Field label="Trade">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => set('category')(c)}
                  className={classNames('rounded-full border px-3 py-1.5 text-sm font-medium transition',
                    f.category === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                  {VENDOR_CATEGORY_EMOJI[c]} {VENDOR_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="+234…" /></Field>
            <Field label="WhatsApp (optional)"><input className="input" value={f.whatsapp} onChange={(e) => set('whatsapp')(e.target.value)} placeholder="+234…" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><select className="input" value={f.location} onChange={(e) => set('location')(e.target.value)}>{LAGOS_AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <Field label="LGA"><input className="input" value={f.lga} onChange={(e) => set('lga')(e.target.value)} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Years of experience"><input type="number" min={0} max={50} className="input" value={f.yearsExperience} onChange={(e) => set('yearsExperience')(Number(e.target.value))} /></Field>
            <Field label="Rate per day (₦)"><input type="number" min={0} step={1000} className="input" value={f.ratePerDay} onChange={(e) => set('ratePerDay')(Number(e.target.value))} /></Field>
          </div>

          <Field label="About your service"><textarea className="input min-h-[90px]" value={f.bio} onChange={(e) => set('bio')(e.target.value)} placeholder="What you do, areas you cover, what makes your work stand out…" /></Field>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-ink-500/5 px-4 py-3 text-sm text-ink-700">
          <ShieldCheck className="h-5 w-5 shrink-0" /> We verify ID and a sample of past work before adding the verified badge.
        </div>

        {error && <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertIcon className="h-4 w-4" />{error}</p>}

        <button onClick={submit} className="btn-primary mt-4 w-full"><CheckIcon className="h-5 w-5" /> Submit vendor profile</button>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={classNames('shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="label">{label}</span>{children}</div>
}
