import type { Property, User, BadgeType } from '@/types'

/** Format a NGN amount, e.g. 2500000 -> "₦2,500,000". */
export function formatNaira(amount: number, opts: { short?: boolean } = {}): string {
  if (opts.short) {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`
  }
  return `₦${amount.toLocaleString('en-NG')}`
}

export function formatRentPerYear(amount: number): string {
  return `${formatNaira(amount)}/yr`
}

/** Relative time, e.g. "3h ago". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export const PROPERTY_TYPE_LABEL: Record<string, string> = {
  self_contain: 'Self Contain',
  mini_flat: 'Mini Flat',
  '2_bedroom': '2 Bedroom',
  '3_bedroom': '3 Bedroom',
  duplex: 'Duplex',
  studio: 'Studio',
  shared: 'Shared',
  any: 'Any type',
}

export const FURNISHING_LABEL: Record<string, string> = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'Semi-furnished',
  furnished: 'Furnished',
  any: 'Any',
}

export const LAGOS_AREAS = [
  'Ikoyi',
  'Lekki Phase 1',
  'Lekki Phase 2',
  'Ajah',
  'Victoria Island',
  'Gbagada',
  'Surulere',
  'Magodo',
  'Yaba',
  'Ikeja GRA',
]

export const AMENITIES = [
  '24/7 Power',
  'Borehole Water',
  'Parking Space',
  'Security / Gateman',
  'CCTV',
  'POP Ceiling',
  'Fitted Kitchen',
  'Wardrobe',
  'Balcony',
  'Air Conditioning',
  'Swimming Pool',
  'Gym',
  'Estate / Gated',
  'Generator',
]

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Is this user allowed to transact (list, book, pay)? */
export function canTransact(user?: User | null): boolean {
  if (!user) return false
  return ['phone', 'kyc', 'fully_verified'].includes(user.verificationLevel)
}

export function canList(user?: User | null): boolean {
  if (!user) return false
  if (user.role !== 'landlord' && user.role !== 'agent') return false
  return ['kyc', 'fully_verified'].includes(user.verificationLevel)
}

export function badgeForOwner(property: Property): BadgeType {
  return property.ownerType === 'agent' ? 'verified_agent' : 'verified_landlord'
}

export function classNames(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/** Deterministic pleasant avatar gradient from a string. */
export function avatarGradient(seed: string): string {
  const gradients = [
    'from-brand-400 to-ink-500',
    'from-ink-500 to-brand-600',
    'from-emerald-400 to-teal-600',
    'from-cyan-500 to-brand-600',
    'from-teal-400 to-emerald-600',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}
