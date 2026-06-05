import type {
  User, Property, Thread, Message, Inspection, EscrowTransaction,
  RentLoan, AppNotification, FraudReport, SavedListing,
} from '@/types'

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`

// --- Users ------------------------------------------------------------------
export const seedUsers: User[] = [
  {
    id: 'u_tunde', name: 'Tunde Bakare', email: 'tunde@homeease.ng', phone: '+2348012345678',
    role: 'tenant', verificationLevel: 'fully_verified',
    kyc: { emailVerified: true, phoneVerified: true, bvnNinVerified: true, selfieVerified: true, roleDocsVerified: false },
    trustScore: 88, badges: ['verified_user'], walletBalance: 0, employmentVerified: true,
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'u_ade', name: 'Mr. Ade Johnson', email: 'ade@homeease.ng', phone: '+2348023456789',
    role: 'landlord', verificationLevel: 'fully_verified',
    kyc: { emailVerified: true, phoneVerified: true, bvnNinVerified: true, selfieVerified: true, roleDocsVerified: true },
    trustScore: 94, badges: ['verified_landlord', 'trusted'], walletBalance: 0,
    createdAt: '2025-11-02T09:00:00Z',
  },
  {
    id: 'u_emeka', name: 'Emeka Obi', email: 'emeka@homeease.ng', phone: '+2348034567890',
    role: 'agent', verificationLevel: 'fully_verified',
    kyc: { emailVerified: true, phoneVerified: true, bvnNinVerified: true, selfieVerified: true, roleDocsVerified: true },
    trustScore: 90, badges: ['verified_agent', 'trusted'], walletBalance: 0,
    createdAt: '2025-12-20T09:00:00Z',
  },
  {
    id: 'u_chidi', name: 'Chidi Nwosu', email: 'chidi@homeease.ng', phone: '+2348045678901',
    role: 'agent', verificationLevel: 'kyc',
    kyc: { emailVerified: true, phoneVerified: true, bvnNinVerified: true, selfieVerified: false, roleDocsVerified: true },
    trustScore: 71, badges: ['verified_agent'], walletBalance: 0,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'u_admin', name: 'HomeEase Admin', email: 'admin@homeease.ng', phone: '+2348000000000',
    role: 'admin', verificationLevel: 'fully_verified',
    kyc: { emailVerified: true, phoneVerified: true, bvnNinVerified: true, selfieVerified: true, roleDocsVerified: true },
    trustScore: 100, badges: ['trusted'], walletBalance: 0,
    createdAt: '2025-10-01T09:00:00Z',
  },
]

// --- Properties -------------------------------------------------------------
export const seedProperties: Property[] = [
  {
    id: 'p_lekki_3bed', ownerId: 'u_ade', ownerType: 'landlord',
    title: 'Modern 3-Bedroom Flat with BQ', description:
      'Tastefully finished 3-bedroom apartment in a serene gated estate. Features fitted kitchen, ensuite rooms, ample parking and 24/7 power supply. Close to Lekki-Epe expressway.',
    rent: 4500000, serviceCharge: 500000, bedrooms: 3, bathrooms: 4,
    location: 'Lekki Phase 1', lga: 'Eti-Osa', gps: { lat: 6.448, lng: 3.471 },
    propertyType: '3_bedroom', amenities: ['24/7 Power', 'Borehole Water', 'Parking Space', 'Security / Gateman', 'CCTV', 'Fitted Kitchen', 'Estate / Gated'],
    furnishing: 'semi_furnished', petFriendly: true,
    images: [img('1502672260266-1c1ef2d93688'), img('1493809842364-78817add7ffb'), img('1560448204-e02f11c3d0e2')],
    videos: [], status: 'published', verifiedProperty: true, featured: true, trustedLandlord: true,
    fraudScore: 4, createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'p_ikoyi_duplex', ownerId: 'u_emeka', ownerType: 'agent',
    title: 'Luxury 4-Bed Duplex, Banana Island Road', description:
      'Exquisite fully detached duplex with private pool, gym and smart-home features. Premium Ikoyi address with top-tier security and uninterrupted power.',
    rent: 15000000, serviceCharge: 2000000, bedrooms: 4, bathrooms: 5,
    location: 'Ikoyi', lga: 'Eti-Osa', gps: { lat: 6.452, lng: 3.434 },
    propertyType: 'duplex', amenities: ['24/7 Power', 'Swimming Pool', 'Gym', 'Security / Gateman', 'CCTV', 'Air Conditioning', 'Estate / Gated'],
    furnishing: 'furnished', petFriendly: false,
    images: [img('1512917774080-9991f1c4c750'), img('1564013799919-ab600027ffc6'), img('1600596542815-ffad4c1539a9')],
    videos: [], status: 'published', verifiedProperty: true, featured: true, trustedLandlord: true,
    fraudScore: 2, createdAt: '2026-05-22T10:00:00Z',
  },
  {
    id: 'p_yaba_mini', ownerId: 'u_emeka', ownerType: 'agent',
    title: 'Cozy Mini Flat near Tech District', description:
      'Affordable mini flat perfect for young professionals. Walking distance to Yaba tech hub, with prepaid meter and secure compound.',
    rent: 1200000, serviceCharge: 100000, bedrooms: 1, bathrooms: 1,
    location: 'Yaba', lga: 'Lagos Mainland', gps: { lat: 6.515, lng: 3.378 },
    propertyType: 'mini_flat', amenities: ['Borehole Water', 'Security / Gateman', 'Wardrobe'],
    furnishing: 'unfurnished', petFriendly: false,
    images: [img('1522708323590-d24dbb6b0267'), img('1505691938895-1758d7feb511')],
    videos: [], status: 'published', verifiedProperty: true, featured: false, trustedLandlord: false,
    fraudScore: 8, createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'p_gbagada_2bed', ownerId: 'u_ade', ownerType: 'landlord',
    title: 'Renovated 2-Bedroom Apartment', description:
      'Newly renovated 2-bedroom flat in a quiet Gbagada street. POP ceiling, fitted wardrobes and reliable water supply.',
    rent: 2200000, serviceCharge: 200000, bedrooms: 2, bathrooms: 2,
    location: 'Gbagada', lga: 'Kosofe', gps: { lat: 6.554, lng: 3.392 },
    propertyType: '2_bedroom', amenities: ['Borehole Water', 'Parking Space', 'POP Ceiling', 'Wardrobe', 'Generator'],
    furnishing: 'unfurnished', petFriendly: true,
    images: [img('1560185007-cde436f6a4d0'), img('1484154218962-a197022b5858')],
    videos: [], status: 'published', verifiedProperty: false, featured: false, trustedLandlord: true,
    fraudScore: 12, createdAt: '2026-05-30T10:00:00Z',
  },
  {
    id: 'p_ajah_self', ownerId: 'u_chidi', ownerType: 'agent',
    title: 'Self Contain Apartment, Ajah', description:
      'Neat self contain with private bathroom and kitchenette. Affordable, secure and close to major bus stops.',
    rent: 700000, serviceCharge: 50000, bedrooms: 1, bathrooms: 1,
    location: 'Ajah', lga: 'Eti-Osa', gps: { lat: 6.466, lng: 3.566 },
    propertyType: 'self_contain', amenities: ['Borehole Water', 'Security / Gateman'],
    furnishing: 'unfurnished', petFriendly: false,
    images: [img('1493809842364-78817add7ffb')],
    videos: [], status: 'published', verifiedProperty: false, featured: false, trustedLandlord: false,
    fraudScore: 18, createdAt: '2026-06-01T10:00:00Z',
  },
  // Pending review — sits in the admin approval queue
  {
    id: 'p_magodo_pending', ownerId: 'u_chidi', ownerType: 'agent',
    title: '3-Bedroom Terrace, Magodo GRA', description:
      'Spacious terrace duplex in Magodo Phase 2. Awaiting physical verification by the HomeEase field team.',
    rent: 3800000, serviceCharge: 400000, bedrooms: 3, bathrooms: 3,
    location: 'Magodo', lga: 'Kosofe',
    propertyType: '3_bedroom', amenities: ['24/7 Power', 'Parking Space', 'Estate / Gated'],
    furnishing: 'semi_furnished', petFriendly: false,
    images: [img('1572120360610-d971b9d7767c')],
    videos: [], status: 'pending_review', verifiedProperty: false, featured: false, trustedLandlord: false,
    fraudScore: 9, createdAt: '2026-06-03T10:00:00Z',
  },
  // Flagged duplicate — reuses p_lekki_3bed's photos & description (different owner)
  {
    id: 'p_lekki_dupe', ownerId: 'u_chidi', ownerType: 'agent',
    title: 'Modern 3-Bedroom Flat with BQ — Lekki', description:
      'Tastefully finished 3-bedroom apartment in a serene gated estate. Features fitted kitchen, ensuite rooms, ample parking and 24/7 power supply. Close to Lekki-Epe expressway.',
    rent: 4500000, serviceCharge: 500000, bedrooms: 3, bathrooms: 4,
    location: 'Lekki Phase 1', lga: 'Eti-Osa',
    propertyType: '3_bedroom', amenities: ['24/7 Power', 'Parking Space', 'Security / Gateman'],
    furnishing: 'semi_furnished', petFriendly: true,
    images: [img('1502672260266-1c1ef2d93688'), img('1493809842364-78817add7ffb')],
    videos: [], status: 'flagged', verifiedProperty: false, featured: false, trustedLandlord: false,
    fraudScore: 86, duplicateOf: 'p_lekki_3bed', createdAt: '2026-06-04T10:00:00Z',
  },
]

export const seedSaved: SavedListing[] = [
  { userId: 'u_tunde', propertyId: 'p_ikoyi_duplex', savedAt: '2026-06-02T10:00:00Z' },
  { userId: 'u_tunde', propertyId: 'p_gbagada_2bed', savedAt: '2026-06-03T10:00:00Z' },
]

// --- Messaging --------------------------------------------------------------
export const seedThreads: Thread[] = [
  { id: 't_tunde_ade', participantIds: ['u_tunde', 'u_ade'], propertyId: 'p_lekki_3bed', lastMessageAt: '2026-06-04T14:30:00Z' },
  { id: 't_tunde_emeka', participantIds: ['u_tunde', 'u_emeka'], propertyId: 'p_ikoyi_duplex', lastMessageAt: '2026-06-03T11:00:00Z' },
]

export const seedMessages: Message[] = [
  { id: 'm1', threadId: 't_tunde_ade', senderId: 'u_tunde', body: 'Good day sir, is the Lekki 3-bedroom still available?', readBy: ['u_tunde', 'u_ade'], propertyRef: 'p_lekki_3bed', createdAt: '2026-06-04T14:00:00Z' },
  { id: 'm2', threadId: 't_tunde_ade', senderId: 'u_ade', body: 'Yes it is. You can book an inspection any day this week.', readBy: ['u_ade', 'u_tunde'], createdAt: '2026-06-04T14:10:00Z' },
  { id: 'm3', threadId: 't_tunde_ade', senderId: 'u_tunde', body: 'Great. Is the rent negotiable?', readBy: ['u_tunde'], createdAt: '2026-06-04T14:30:00Z' },
  { id: 'm4', threadId: 't_tunde_emeka', senderId: 'u_tunde', body: 'Hi Emeka, I would like to view the Ikoyi duplex.', readBy: ['u_tunde', 'u_emeka'], propertyRef: 'p_ikoyi_duplex', createdAt: '2026-06-03T10:50:00Z' },
  { id: 'm5', threadId: 't_tunde_emeka', senderId: 'u_emeka', body: 'Of course! I have a slot Saturday at 11am.', readBy: ['u_emeka', 'u_tunde'], createdAt: '2026-06-03T11:00:00Z' },
]

// --- Inspections ------------------------------------------------------------
export const seedInspections: Inspection[] = [
  { id: 'i1', propertyId: 'p_lekki_3bed', tenantId: 'u_tunde', hostId: 'u_ade', date: '2026-06-08', time: '11:00', status: 'confirmed', createdAt: '2026-06-04T15:00:00Z' },
  { id: 'i2', propertyId: 'p_ikoyi_duplex', tenantId: 'u_tunde', hostId: 'u_emeka', date: '2026-05-20', time: '14:00', status: 'completed', createdAt: '2026-05-15T15:00:00Z' },
]

// --- Escrow -----------------------------------------------------------------
export const seedEscrow: EscrowTransaction[] = [
  {
    id: 'e1', propertyId: 'p_ikoyi_duplex', tenantId: 'u_tunde', landlordId: 'u_emeka',
    amount: 15000000, status: 'held', moveInConfirmed: false,
    disputeWindowEnds: '2026-06-12T10:00:00Z', createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-05T10:00:00Z',
    timeline: [
      { label: 'Payment initiated by tenant', at: '2026-06-05T09:30:00Z' },
      { label: 'Funds held in escrow', at: '2026-06-05T10:00:00Z' },
    ],
  },
]

// --- Loans ------------------------------------------------------------------
export const seedLoans: RentLoan[] = [
  {
    id: 'l1', tenantId: 'u_tunde', propertyId: 'p_gbagada_2bed', principal: 2200000, tenureMonths: 6,
    interestRate: 6, monthlyRepayment: 388667, status: 'active', kycComplete: true, employmentVerified: true,
    appliedAt: '2026-05-25T10:00:00Z',
    repayments: [
      { dueDate: '2026-06-25', amount: 388667, paid: true },
      { dueDate: '2026-07-25', amount: 388667, paid: false },
      { dueDate: '2026-08-25', amount: 388667, paid: false },
      { dueDate: '2026-09-25', amount: 388667, paid: false },
      { dueDate: '2026-10-25', amount: 388667, paid: false },
      { dueDate: '2026-11-25', amount: 388665, paid: false },
    ],
  },
]

// --- Notifications ----------------------------------------------------------
export const seedNotifications: AppNotification[] = [
  { id: 'n1', userId: 'u_tunde', type: 'inspection', title: 'Inspection confirmed', body: 'Your inspection for the Lekki 3-bedroom is confirmed for Mon, 8 Jun at 11:00.', read: false, createdAt: '2026-06-04T15:00:00Z' },
  { id: 'n2', userId: 'u_tunde', type: 'escrow', title: 'Funds held in escrow', body: '₦15,000,000 is securely held. It will be released after you confirm move-in.', read: false, createdAt: '2026-06-05T10:00:00Z' },
  { id: 'n3', userId: 'u_admin', type: 'fraud', title: 'Suspicious listing flagged', body: 'A new Lekki listing matches an existing verified property (86% fraud score).', read: false, createdAt: '2026-06-04T10:05:00Z' },
]

export const seedFraudReports: FraudReport[] = [
  {
    id: 'f1', propertyId: 'p_lekki_dupe', reason: 'Duplicate of verified listing (photos + description match)',
    fraudScore: 86, matchedPropertyId: 'p_lekki_3bed', status: 'open', createdAt: '2026-06-04T10:05:00Z',
  },
]

// Demo accounts surfaced on the login screen for quick role switching.
export const DEMO_ACCOUNTS = [
  { email: 'tunde@homeease.ng', role: 'Tenant', name: 'Tunde' },
  { email: 'ade@homeease.ng', role: 'Landlord', name: 'Mr. Ade' },
  { email: 'emeka@homeease.ng', role: 'Agent', name: 'Emeka' },
  { email: 'admin@homeease.ng', role: 'Admin', name: 'Admin' },
] as const
