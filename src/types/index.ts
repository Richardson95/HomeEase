// ============================================================================
// HomeEase — Domain types. These mirror the database schema (see SCHEMA.md).
// Every entity uses a string `id` (would be a UUID/ObjectId server-side).
// ============================================================================

export type Role = 'tenant' | 'landlord' | 'agent' | 'admin'

export type VerificationLevel =
  | 'unverified' // can browse, cannot transact
  | 'email' // email confirmed
  | 'phone' // OTP confirmed
  | 'kyc' // BVN/NIN confirmed
  | 'fully_verified' // KYC + selfie liveness + role docs

export interface KycStep {
  key: 'email' | 'phone' | 'bvn_nin' | 'selfie' | 'role_docs'
  label: string
  completed: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  avatarUrl?: string
  verificationLevel: VerificationLevel
  kyc: {
    emailVerified: boolean
    phoneVerified: boolean
    bvnNinVerified: boolean
    selfieVerified: boolean
    roleDocsVerified: boolean // CofO/Deed (landlord), license (agent)
  }
  trustScore: number // 0–100 community credibility
  badges: BadgeType[]
  walletBalance: number // escrow wallet, in NGN kobo-free naira
  createdAt: string
  // Lender KYC extras used by Rent Assurance
  employmentVerified?: boolean
}

export type BadgeType =
  | 'verified_user'
  | 'verified_landlord'
  | 'verified_agent'
  | 'trusted'

export type PropertyType =
  | 'self_contain'
  | 'mini_flat'
  | '2_bedroom'
  | '3_bedroom'
  | 'duplex'
  | 'studio'
  | 'shared'

export type FurnishingStatus = 'unfurnished' | 'semi_furnished' | 'furnished'

export type ListingStatus =
  | 'draft'
  | 'pending_review' // submitted, awaiting admin/field verification
  | 'published'
  | 'rejected'
  | 'rented'
  | 'flagged' // fraud queue

export interface Property {
  id: string
  ownerId: string // User.id (landlord or agent)
  ownerType: 'landlord' | 'agent'
  title: string
  description: string
  rent: number // annual rent, NGN
  serviceCharge: number
  bedrooms: number
  bathrooms: number
  location: string // estate / area
  lga: string // Local Government Area
  gps?: { lat: number; lng: number }
  propertyType: PropertyType
  amenities: string[]
  furnishing: FurnishingStatus
  petFriendly: boolean
  images: string[]
  videos: string[]
  status: ListingStatus
  verifiedProperty: boolean // physically inspected
  featured: boolean
  trustedLandlord: boolean
  fraudScore: number // 0–100, AI duplicate detection
  duplicateOf?: string // Property.id if flagged as duplicate
  createdAt: string
}

export interface SavedListing {
  userId: string
  propertyId: string
  savedAt: string
}

export type InspectionStatus =
  | 'pending' // awaiting agent/landlord approval
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'

export interface Inspection {
  id: string
  propertyId: string
  tenantId: string
  hostId: string // owner of the property
  date: string // ISO date
  time: string // 'HH:mm'
  status: InspectionStatus
  notes?: string
  createdAt: string
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  body: string
  attachment?: { name: string; type: 'image' | 'document'; url: string }
  propertyRef?: string // Property.id preview embedded in chat
  readBy: string[]
  createdAt: string
}

export interface Thread {
  id: string
  participantIds: string[]
  propertyId?: string
  lastMessageAt: string
}

export type EscrowStatus = 'pending' | 'held' | 'released' | 'disputed' | 'refunded'

export interface EscrowTransaction {
  id: string
  propertyId: string
  tenantId: string
  landlordId: string
  amount: number
  status: EscrowStatus
  moveInConfirmed: boolean
  disputeWindowEnds: string // ISO — 7 days after held
  createdAt: string
  updatedAt: string
  timeline: { label: string; at: string }[]
}

export type LoanStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'repaid'

export interface RentLoan {
  id: string
  tenantId: string
  propertyId?: string
  principal: number // amount financed
  tenureMonths: 3 | 4 | 5 | 6
  interestRate: number // annual %, 5–7
  monthlyRepayment: number
  status: LoanStatus
  kycComplete: boolean
  employmentVerified: boolean
  appliedAt: string
  repayments: { dueDate: string; amount: number; paid: boolean }[]
}

export type NotificationType =
  | 'verification'
  | 'inspection'
  | 'message'
  | 'escrow'
  | 'loan'
  | 'fraud'
  | 'system'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface FraudReport {
  id: string
  propertyId: string
  reason: string
  fraudScore: number
  matchedPropertyId?: string
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
  createdAt: string
}

// Filters used by the Search page
export interface SearchFilters {
  query: string
  minPrice?: number
  maxPrice?: number
  lga?: string
  propertyType?: PropertyType | 'any'
  furnishing?: FurnishingStatus | 'any'
  verifiedOnly: boolean
  ownerType?: 'agent' | 'landlord' | 'any'
  petFriendly?: boolean
}
