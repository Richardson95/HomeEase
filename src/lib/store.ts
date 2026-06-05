import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User, Property, Thread, Message, Inspection, EscrowTransaction, RentLoan,
  AppNotification, FraudReport, SavedListing, Role, SearchFilters,
} from '@/types'
import {
  seedUsers, seedProperties, seedThreads, seedMessages, seedInspections,
  seedEscrow, seedLoans, seedNotifications, seedFraudReports, seedSaved,
} from '@/data/mockData'
import { uid } from './utils'
import { detectDuplicate, FRAUD_FLAG_THRESHOLD } from './fraud'

interface StoreState {
  // data
  users: User[]
  properties: Property[]
  saved: SavedListing[]
  threads: Thread[]
  messages: Message[]
  inspections: Inspection[]
  escrow: EscrowTransaction[]
  loans: RentLoan[]
  notifications: AppNotification[]
  fraudReports: FraudReport[]
  // session
  currentUserId: string | null
  filters: SearchFilters

  // auth
  login: (email: string, _password: string) => { ok: boolean; error?: string }
  signup: (data: { name: string; email: string; phone: string; role: Role }) => { ok: boolean; error?: string }
  logout: () => void
  currentUser: () => User | null
  updateUser: (patch: Partial<User>) => void

  // verification
  verifyEmail: () => void
  verifyPhone: () => void
  verifyBvnNin: () => void
  verifySelfie: () => void
  verifyRoleDocs: () => void

  // listings
  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'fraudScore' | 'status' | 'verifiedProperty' | 'featured' | 'trustedLandlord'>) => { id: string; flagged: boolean }
  setFilters: (patch: Partial<SearchFilters>) => void
  toggleSaved: (propertyId: string) => void
  isSaved: (propertyId: string) => boolean

  // messaging
  getOrCreateThread: (otherUserId: string, propertyId?: string) => string
  sendMessage: (threadId: string, body: string, propertyRef?: string, attachment?: Message['attachment']) => void
  markThreadRead: (threadId: string) => void

  // inspections
  bookInspection: (propertyId: string, date: string, time: string) => { ok: boolean; error?: string }
  updateInspection: (id: string, patch: Partial<Inspection>) => void

  // escrow
  payToEscrow: (propertyId: string, landlordId: string, amount: number) => string
  confirmMoveIn: (escrowId: string) => void
  disputeEscrow: (escrowId: string) => void

  // loans
  applyLoan: (data: { principal: number; tenureMonths: 3 | 4 | 5 | 6; interestRate: number; propertyId?: string }) => string

  // notifications
  notify: (userId: string, n: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>) => void
  markNotificationsRead: () => void

  // admin
  approveProperty: (id: string) => void
  rejectProperty: (id: string) => void
  removeProperty: (id: string) => void
  suspendUser: (id: string) => void
  resolveFraud: (id: string, action: 'resolved' | 'dismissed') => void
  resolveDispute: (escrowId: string, action: 'release' | 'refund') => void
}

function monthlyRepayment(principal: number, tenure: number, rate: number): number {
  const total = principal * (1 + rate / 100)
  return Math.round(total / tenure)
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      properties: seedProperties,
      saved: seedSaved,
      threads: seedThreads,
      messages: seedMessages,
      inspections: seedInspections,
      escrow: seedEscrow,
      loans: seedLoans,
      notifications: seedNotifications,
      fraudReports: seedFraudReports,
      currentUserId: null,
      filters: { query: '', verifiedOnly: false, propertyType: 'any', furnishing: 'any', ownerType: 'any' },

      currentUser: () => get().users.find((u) => u.id === get().currentUserId) || null,

      login: (email) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (!user) return { ok: false, error: 'No account found with that email.' }
        set({ currentUserId: user.id })
        return { ok: true }
      },

      signup: ({ name, email, phone, role }) => {
        if (get().users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
          return { ok: false, error: 'An account with this email already exists.' }
        const user: User = {
          id: uid('u'), name, email, phone, role, verificationLevel: 'unverified',
          kyc: { emailVerified: false, phoneVerified: false, bvnNinVerified: false, selfieVerified: false, roleDocsVerified: false },
          trustScore: 50, badges: [], walletBalance: 0, createdAt: new Date().toISOString(),
        }
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
        return { ok: true }
      },

      logout: () => set({ currentUserId: null }),

      updateUser: (patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)) })),

      // --- verification: recompute level + badges as steps complete ----------
      verifyEmail: () => updateKyc(set, get, { emailVerified: true }),
      verifyPhone: () => updateKyc(set, get, { phoneVerified: true }),
      verifyBvnNin: () => updateKyc(set, get, { bvnNinVerified: true }),
      verifySelfie: () => updateKyc(set, get, { selfieVerified: true }),
      verifyRoleDocs: () => updateKyc(set, get, { roleDocsVerified: true }),

      // --- listings ----------------------------------------------------------
      addProperty: (p) => {
        const id = uid('p')
        const candidate: Property = {
          ...p, id, createdAt: new Date().toISOString(), fraudScore: 0,
          status: 'pending_review', verifiedProperty: false, featured: false, trustedLandlord: false,
        }
        const dup = detectDuplicate(candidate, get().properties)
        candidate.fraudScore = dup.fraudScore
        const flagged = dup.fraudScore >= FRAUD_FLAG_THRESHOLD
        if (flagged) {
          candidate.status = 'flagged'
          candidate.duplicateOf = dup.matchedPropertyId
        }
        set((s) => ({ properties: [candidate, ...s.properties] }))
        if (flagged) {
          set((s) => ({
            fraudReports: [
              { id: uid('f'), propertyId: id, reason: dup.reasons.join('; ') || 'Possible duplicate', fraudScore: dup.fraudScore, matchedPropertyId: dup.matchedPropertyId, status: 'open', createdAt: new Date().toISOString() },
              ...s.fraudReports,
            ],
          }))
          get().users.filter((u) => u.role === 'admin').forEach((a) =>
            get().notify(a.id, { type: 'fraud', title: 'Suspicious listing flagged', body: `New listing "${candidate.title}" scored ${dup.fraudScore}% on fraud detection.` }),
          )
        } else {
          get().users.filter((u) => u.role === 'admin').forEach((a) =>
            get().notify(a.id, { type: 'system', title: 'Listing awaiting review', body: `"${candidate.title}" submitted for verification.` }),
          )
        }
        return { id, flagged }
      },

      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

      toggleSaved: (propertyId) => {
        const uidc = get().currentUserId
        if (!uidc) return
        const exists = get().saved.some((x) => x.userId === uidc && x.propertyId === propertyId)
        set((s) => ({
          saved: exists
            ? s.saved.filter((x) => !(x.userId === uidc && x.propertyId === propertyId))
            : [...s.saved, { userId: uidc, propertyId, savedAt: new Date().toISOString() }],
        }))
      },
      isSaved: (propertyId) => {
        const uidc = get().currentUserId
        return !!uidc && get().saved.some((x) => x.userId === uidc && x.propertyId === propertyId)
      },

      // --- messaging ---------------------------------------------------------
      getOrCreateThread: (otherUserId, propertyId) => {
        const me = get().currentUserId!
        const existing = get().threads.find(
          (t) => t.participantIds.includes(me) && t.participantIds.includes(otherUserId) && (!propertyId || t.propertyId === propertyId),
        )
        if (existing) return existing.id
        const t: Thread = { id: uid('t'), participantIds: [me, otherUserId], propertyId, lastMessageAt: new Date().toISOString() }
        set((s) => ({ threads: [t, ...s.threads] }))
        return t.id
      },

      sendMessage: (threadId, body, propertyRef, attachment) => {
        const me = get().currentUserId!
        const msg: Message = { id: uid('m'), threadId, senderId: me, body, propertyRef, attachment, readBy: [me], createdAt: new Date().toISOString() }
        set((s) => ({
          messages: [...s.messages, msg],
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, lastMessageAt: msg.createdAt } : t)),
        }))
        const thread = get().threads.find((t) => t.id === threadId)
        thread?.participantIds.filter((p) => p !== me).forEach((p) =>
          get().notify(p, { type: 'message', title: 'New message', body: body.slice(0, 60) }),
        )
      },

      markThreadRead: (threadId) => {
        const me = get().currentUserId!
        set((s) => ({
          messages: s.messages.map((m) =>
            m.threadId === threadId && !m.readBy.includes(me) ? { ...m, readBy: [...m.readBy, me] } : m,
          ),
        }))
      },

      // --- inspections -------------------------------------------------------
      bookInspection: (propertyId, date, time) => {
        const me = get().currentUserId
        if (!me) return { ok: false, error: 'Please sign in to book.' }
        const prop = get().properties.find((p) => p.id === propertyId)
        if (!prop) return { ok: false, error: 'Property not found.' }
        const clash = get().inspections.some(
          (i) => i.propertyId === propertyId && i.date === date && i.time === time && i.status !== 'cancelled',
        )
        if (clash) return { ok: false, error: 'That slot is already booked. Please choose another time.' }
        const insp: Inspection = { id: uid('i'), propertyId, tenantId: me, hostId: prop.ownerId, date, time, status: 'confirmed', createdAt: new Date().toISOString() }
        set((s) => ({ inspections: [insp, ...s.inspections] }))
        get().notify(prop.ownerId, { type: 'inspection', title: 'New inspection booked', body: `An inspection was booked for "${prop.title}" on ${date} at ${time}.` })
        get().notify(me, { type: 'inspection', title: 'Inspection confirmed', body: `Your inspection for "${prop.title}" is confirmed for ${date} at ${time}.` })
        return { ok: true }
      },

      updateInspection: (id, patch) =>
        set((s) => ({ inspections: s.inspections.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      // --- escrow ------------------------------------------------------------
      payToEscrow: (propertyId, landlordId, amount) => {
        const me = get().currentUserId!
        const now = new Date()
        const ends = new Date(now.getTime() + 7 * 86400000).toISOString()
        const tx: EscrowTransaction = {
          id: uid('e'), propertyId, tenantId: me, landlordId, amount, status: 'held', moveInConfirmed: false,
          disputeWindowEnds: ends, createdAt: now.toISOString(), updatedAt: now.toISOString(),
          timeline: [
            { label: 'Payment initiated by tenant', at: now.toISOString() },
            { label: 'Funds held in escrow', at: now.toISOString() },
          ],
        }
        set((s) => ({ escrow: [tx, ...s.escrow] }))
        get().notify(landlordId, { type: 'escrow', title: 'Payment in escrow', body: `A tenant has paid into escrow. Funds release after move-in confirmation.` })
        get().notify(me, { type: 'escrow', title: 'Funds held safely', body: `Your payment is held in escrow until you confirm move-in.` })
        return tx.id
      },

      confirmMoveIn: (escrowId) => {
        const tx = get().escrow.find((e) => e.id === escrowId)
        if (!tx) return
        set((s) => ({
          escrow: s.escrow.map((e) =>
            e.id === escrowId
              ? { ...e, status: 'released', moveInConfirmed: true, updatedAt: new Date().toISOString(), timeline: [...e.timeline, { label: 'Move-in confirmed by tenant', at: new Date().toISOString() }, { label: 'Funds released to landlord', at: new Date().toISOString() }] }
              : e,
          ),
          users: s.users.map((u) => (u.id === tx.landlordId ? { ...u, walletBalance: u.walletBalance + tx.amount } : u)),
        }))
        get().notify(tx.landlordId, { type: 'escrow', title: 'Funds released', body: `Move-in confirmed. ₦${tx.amount.toLocaleString()} has been credited to your wallet.` })
      },

      disputeEscrow: (escrowId) => {
        set((s) => ({
          escrow: s.escrow.map((e) =>
            e.id === escrowId
              ? { ...e, status: 'disputed', updatedAt: new Date().toISOString(), timeline: [...e.timeline, { label: 'Dispute raised — under review', at: new Date().toISOString() }] }
              : e,
          ),
        }))
        const tx = get().escrow.find((e) => e.id === escrowId)
        get().users.filter((u) => u.role === 'admin').forEach((a) =>
          get().notify(a.id, { type: 'escrow', title: 'Escrow dispute raised', body: `A dispute was raised on transaction ${tx?.id}.` }),
        )
      },

      // --- loans -------------------------------------------------------------
      applyLoan: ({ principal, tenureMonths, interestRate, propertyId }) => {
        const me = get().currentUser()!
        const monthly = monthlyRepayment(principal, tenureMonths, interestRate)
        const start = new Date()
        const repayments = Array.from({ length: tenureMonths }, (_, i) => {
          const d = new Date(start)
          d.setMonth(d.getMonth() + i + 1)
          return { dueDate: d.toISOString().slice(0, 10), amount: monthly, paid: false }
        })
        const kycComplete = ['kyc', 'fully_verified'].includes(me.verificationLevel)
        const loan: RentLoan = {
          id: uid('l'), tenantId: me.id, propertyId, principal, tenureMonths, interestRate,
          monthlyRepayment: monthly, status: kycComplete && me.employmentVerified ? 'approved' : 'pending',
          kycComplete, employmentVerified: !!me.employmentVerified, appliedAt: new Date().toISOString(), repayments,
        }
        set((s) => ({ loans: [loan, ...s.loans] }))
        get().notify(me.id, { type: 'loan', title: loan.status === 'approved' ? 'Loan pre-approved' : 'Application received', body: loan.status === 'approved' ? `Your rent loan of ₦${principal.toLocaleString()} is pre-approved.` : 'We are reviewing your Rent Assurance application.' })
        return loan.id
      },

      // --- notifications -----------------------------------------------------
      notify: (userId, n) =>
        set((s) => ({
          notifications: [{ id: uid('n'), userId, read: false, createdAt: new Date().toISOString(), ...n }, ...s.notifications],
        })),

      markNotificationsRead: () => {
        const me = get().currentUserId
        set((s) => ({ notifications: s.notifications.map((n) => (n.userId === me ? { ...n, read: true } : n)) }))
      },

      // --- admin -------------------------------------------------------------
      approveProperty: (id) =>
        set((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, status: 'published', verifiedProperty: true } : p)) })),
      rejectProperty: (id) =>
        set((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p)) })),
      removeProperty: (id) => set((s) => ({ properties: s.properties.filter((p) => p.id !== id) })),
      suspendUser: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, verificationLevel: 'unverified', badges: [], trustScore: Math.min(u.trustScore, 20) } : u)) })),
      resolveFraud: (id, action) =>
        set((s) => ({
          fraudReports: s.fraudReports.map((f) => (f.id === id ? { ...f, status: action } : f)),
          properties: action === 'dismissed'
            ? s.properties.map((p) => {
                const f = s.fraudReports.find((x) => x.id === id)
                return f && p.id === f.propertyId ? { ...p, status: 'pending_review', fraudScore: 0, duplicateOf: undefined } : p
              })
            : s.properties,
        })),
      resolveDispute: (escrowId, action) =>
        set((s) => ({
          escrow: s.escrow.map((e) =>
            e.id === escrowId
              ? { ...e, status: action === 'release' ? 'released' : 'refunded', updatedAt: new Date().toISOString(), timeline: [...e.timeline, { label: action === 'release' ? 'Dispute resolved — funds released' : 'Dispute resolved — refunded to tenant', at: new Date().toISOString() }] }
              : e,
          ),
        })),
    }),
    {
      name: 'homeease-store',
      version: 1,
      partialize: (s) => ({
        users: s.users, properties: s.properties, saved: s.saved, threads: s.threads,
        messages: s.messages, inspections: s.inspections, escrow: s.escrow, loans: s.loans,
        notifications: s.notifications, fraudReports: s.fraudReports, currentUserId: s.currentUserId,
      }),
    },
  ),
)

// Recompute verification level + badges whenever a KYC step flips.
function updateKyc(
  set: (fn: (s: StoreState) => Partial<StoreState>) => void,
  get: () => StoreState,
  patch: Partial<User['kyc']>,
) {
  const me = get().currentUser()
  if (!me) return
  const kyc = { ...me.kyc, ...patch }
  let level: User['verificationLevel'] = 'unverified'
  if (kyc.emailVerified) level = 'email'
  if (kyc.phoneVerified) level = 'phone'
  if (kyc.bvnNinVerified) level = 'kyc'
  if (kyc.bvnNinVerified && kyc.selfieVerified && (me.role === 'tenant' || kyc.roleDocsVerified)) level = 'fully_verified'

  const badges: User['badges'] = []
  if (kyc.bvnNinVerified) badges.push('verified_user')
  if (level === 'fully_verified' && me.role === 'landlord') badges.push('verified_landlord')
  if (level === 'fully_verified' && me.role === 'agent') badges.push('verified_agent')
  if (me.trustScore >= 80) badges.push('trusted')

  set((s) => ({
    users: s.users.map((u) => (u.id === me.id ? { ...u, kyc, verificationLevel: level, badges } : u)),
  }))
}
