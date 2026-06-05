import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { useStore } from '@/lib/store'
import { formatNaira, PROPERTY_TYPE_LABEL, classNames, badgeForOwner } from '@/lib/utils'
import { BedIcon, BathIcon, PinIcon, HeartIcon, ShieldCheck, StarIcon } from './icons'

export function ListingCard({ property, className }: { property: Property; className?: string }) {
  const isSaved = useStore((s) => s.isSaved(property.id))
  const toggleSaved = useStore((s) => s.toggleSaved)
  const currentUser = useStore((s) => s.currentUser())

  return (
    <Link
      to={`/listing/${property.id}`}
      className={classNames(
        'card group relative block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
        />
        {/* gradient scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.verifiedProperty && (
            <span className="chip bg-brand-600/95 text-white shadow-sm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
          {property.featured && (
            <span className="chip bg-amber-400/95 text-amber-950 shadow-sm backdrop-blur">★ Featured</span>
          )}
        </div>

        {currentUser && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleSaved(property.id) }}
            aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur-md transition hover:scale-105 hover:bg-white active:scale-90"
          >
            <HeartIcon className={classNames('h-5 w-5 transition', isSaved && 'scale-110 fill-red-500 text-red-500')} />
          </button>
        )}

        {/* price on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <p className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {formatNaira(property.rent, { short: true })}
            <span className="text-sm font-semibold text-white/80">/yr</span>
          </p>
          <span className="chip bg-white/90 text-slate-700 shadow-sm backdrop-blur">{PROPERTY_TYPE_LABEL[property.propertyType]}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-bold tracking-tight text-slate-900">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <PinIcon className="h-4 w-4 shrink-0 text-slate-400" />
          {property.location}, {property.lga}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><BedIcon className="h-4 w-4 text-slate-400" />{property.bedrooms}</span>
          <span className="inline-flex items-center gap-1.5"><BathIcon className="h-4 w-4 text-slate-400" />{property.bathrooms}</span>
          {property.trustedLandlord && (
            <span className="inline-flex items-center gap-1 text-amber-600"><StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />Trusted</span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {badgeForOwner(property) === 'verified_agent' ? 'Agent' : 'Owner'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
      </div>
    </div>
  )
}
