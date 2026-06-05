import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { ListingCard } from '@/components/ListingCard'
import { EmptyState } from '@/components/common'
import { SearchIcon, FilterIcon, XIcon, ShieldCheck } from '@/components/icons'
import { LAGOS_AREAS, PROPERTY_TYPE_LABEL, FURNISHING_LABEL, formatNaira, classNames } from '@/lib/utils'
import type { Property } from '@/types'

const TYPES = ['any', 'self_contain', 'mini_flat', '2_bedroom', '3_bedroom', 'duplex', 'studio'] as const
const PRICE_PRESETS = [
  { label: 'Any price', min: undefined, max: undefined },
  { label: 'Under ₦1M', min: 0, max: 1_000_000 },
  { label: '₦1M – ₦3M', min: 1_000_000, max: 3_000_000 },
  { label: '₦3M – ₦6M', min: 3_000_000, max: 6_000_000 },
  { label: '₦6M+', min: 6_000_000, max: undefined },
]

export default function Search() {
  const filters = useStore((s) => s.filters)
  const setFilters = useStore((s) => s.setFilters)
  const properties = useStore((s) => s.properties)
  const [sheetOpen, setSheetOpen] = useState(false)

  const results = useMemo(() => filterProperties(properties.filter((p) => p.status === 'published'), filters), [properties, filters])

  const activeCount =
    (filters.lga ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.propertyType && filters.propertyType !== 'any' ? 1 : 0) +
    (filters.furnishing && filters.furnishing !== 'any' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) + (filters.ownerType && filters.ownerType !== 'any' ? 1 : 0) + (filters.petFriendly ? 1 : 0)

  return (
    <div className="container-wide">
      {/* Search bar */}
      <div className="sticky top-14 z-30 -mx-4 mb-4 bg-slate-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="Search area, title or LGA…"
              className="input pl-10"
            />
            {filters.query && (
              <button onClick={() => setFilters({ query: '' })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Clear"><XIcon className="h-4 w-4" /></button>
            )}
          </div>
          <button onClick={() => setSheetOpen(true)} className="btn-secondary relative shrink-0">
            <FilterIcon className="h-5 w-5" /> <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{activeCount}</span>}
          </button>
        </div>

        {/* Quick chips */}
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          <FilterChip active={filters.verifiedOnly} onClick={() => setFilters({ verifiedOnly: !filters.verifiedOnly })}>
            <ShieldCheck className="h-3.5 w-3.5" /> Verified only
          </FilterChip>
          <FilterChip active={filters.ownerType === 'agent'} onClick={() => setFilters({ ownerType: filters.ownerType === 'agent' ? 'any' : 'agent' })}>Agents</FilterChip>
          <FilterChip active={filters.ownerType === 'landlord'} onClick={() => setFilters({ ownerType: filters.ownerType === 'landlord' ? 'any' : 'landlord' })}>Owners</FilterChip>
          <FilterChip active={!!filters.petFriendly} onClick={() => setFilters({ petFriendly: !filters.petFriendly })}>Pet-friendly</FilterChip>
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-500">{results.length} home{results.length !== 1 ? 's' : ''} found</p>

      {results.length === 0 ? (
        <EmptyState icon={<SearchIcon className="h-7 w-7" />} title="No homes match your filters" body="Try widening your price range or clearing some filters." action={<button className="btn-secondary" onClick={() => setFilters({ query: '', lga: undefined, minPrice: undefined, maxPrice: undefined, propertyType: 'any', furnishing: 'any', verifiedOnly: false, ownerType: 'any', petFriendly: false })}>Clear all filters</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => <ListingCard key={p.id} property={p} />)}
        </div>
      )}

      {/* Filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><XIcon className="h-5 w-5" /></button>
            </div>

            <FilterGroup label="Price (annual rent)">
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((p) => {
                  const active = filters.minPrice === p.min && filters.maxPrice === p.max
                  return <Pill key={p.label} active={active} onClick={() => setFilters({ minPrice: p.min, maxPrice: p.max })}>{p.label}</Pill>
                })}
              </div>
            </FilterGroup>

            <FilterGroup label="Location (Area / LGA)">
              <div className="flex flex-wrap gap-2">
                <Pill active={!filters.lga} onClick={() => setFilters({ lga: undefined })}>All Lagos</Pill>
                {LAGOS_AREAS.map((a) => <Pill key={a} active={filters.lga === a} onClick={() => setFilters({ lga: a })}>{a}</Pill>)}
              </div>
            </FilterGroup>

            <FilterGroup label="Property type">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => <Pill key={t} active={(filters.propertyType || 'any') === t} onClick={() => setFilters({ propertyType: t })}>{PROPERTY_TYPE_LABEL[t]}</Pill>)}
              </div>
            </FilterGroup>

            <FilterGroup label="Furnishing">
              <div className="flex flex-wrap gap-2">
                {(['any', 'unfurnished', 'semi_furnished', 'furnished'] as const).map((f) => <Pill key={f} active={(filters.furnishing || 'any') === f} onClick={() => setFilters({ furnishing: f })}>{FURNISHING_LABEL[f]}</Pill>)}
              </div>
            </FilterGroup>

            <FilterGroup label="Listed by">
              <div className="flex flex-wrap gap-2">
                {(['any', 'agent', 'landlord'] as const).map((o) => <Pill key={o} active={(filters.ownerType || 'any') === o} onClick={() => setFilters({ ownerType: o })}>{o === 'any' ? 'Anyone' : o === 'agent' ? 'Agent' : 'Owner'}</Pill>)}
              </div>
            </FilterGroup>

            <label className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><ShieldCheck className="h-4 w-4 text-brand-600" /> Verified properties only</span>
              <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setFilters({ verifiedOnly: e.target.checked })} className="h-5 w-5 accent-brand-600" />
            </label>

            <div className="mt-5 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setFilters({ lga: undefined, minPrice: undefined, maxPrice: undefined, propertyType: 'any', furnishing: 'any', verifiedOnly: false, ownerType: 'any', petFriendly: false })}>Reset</button>
              <button className="btn-primary flex-1" onClick={() => setSheetOpen(false)}>Show {results.length} homes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function filterProperties(list: Property[], f: ReturnType<typeof useStore.getState>['filters']): Property[] {
  const q = f.query.trim().toLowerCase()
  return list.filter((p) => {
    if (q && !`${p.title} ${p.location} ${p.lga} ${p.description}`.toLowerCase().includes(q)) return false
    if (f.lga && p.location !== f.lga && p.lga !== f.lga) return false
    if (f.minPrice != null && p.rent < f.minPrice) return false
    if (f.maxPrice != null && p.rent > f.maxPrice) return false
    if (f.propertyType && f.propertyType !== 'any' && p.propertyType !== f.propertyType) return false
    if (f.furnishing && f.furnishing !== 'any' && p.furnishing !== f.furnishing) return false
    if (f.verifiedOnly && !p.verifiedProperty) return false
    if (f.ownerType && f.ownerType !== 'any' && p.ownerType !== f.ownerType) return false
    if (f.petFriendly && !p.petFriendly) return false
    return true
  })
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={classNames('inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition',
      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
      {children}
    </button>
  )
}
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-5"><p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>{children}</div>
}
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={classNames('rounded-full border px-3 py-1.5 text-sm font-medium transition',
      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
      {children}
    </button>
  )
}
