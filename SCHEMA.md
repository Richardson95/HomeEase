# HomeEase — Database Schema & App Navigation

> Mobile-first rental marketplace for Lagos. This document is the source of truth
> for the data model and navigation. The TypeScript mirror lives in `src/types/index.ts`.
> The MVP ships with an in-browser persisted store (Zustand + localStorage) that
> implements exactly these collections, so the front end is production-shaped and
> can be swapped for Postgres/Firestore without UI changes.

## 1. Entity Relationship Overview

```
User (1) ──< Property (owner)              Property (1) ──< Inspection
User (1) ──< Inspection (tenant)           Property (1) ──< EscrowTransaction
User (1) ──< SavedListing >── Property      Property (1) ──< FraudReport
User (M) ──< Thread >── (M) User            Thread (1) ──< Message
User (1) ──< EscrowTransaction (tenant/landlord)
User (1) ──< RentLoan
User (1) ──< AppNotification
```

## 2. Collections / Tables

### users
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| name, email (unique), phone (unique) | string | |
| role | enum | tenant \| landlord \| agent \| admin |
| verificationLevel | enum | unverified → email → phone → kyc → fully_verified |
| kyc | json | emailVerified, phoneVerified, bvnNinVerified, selfieVerified, roleDocsVerified |
| trustScore | int | 0–100 community credibility |
| badges | json[] | verified_user, verified_landlord, verified_agent, trusted |
| walletBalance | numeric | escrow wallet (NGN) |
| employmentVerified | bool | used by Rent Assurance |

**Rule:** only users with `verificationLevel >= kyc` may list or transact. Unverified users browse only.

### properties
FK `ownerId → users.id`. Indexes on `lga`, `rent`, `status`, `verifiedProperty`.
Holds `fraudScore` + optional `duplicateOf` set by the AI duplicate detector.
`status`: draft → pending_review → published / rejected / flagged → rented.

### saved_listings
Composite PK `(userId, propertyId)`. Favorites.

### inspections
FK `propertyId`, `tenantId`, `hostId`. Unique constraint on `(propertyId, date, time)`
prevents double-booking. `status`: pending → confirmed → completed / cancelled / rescheduled.
**Rule:** tenant must be `>= phone` verified to book.

### threads / messages
`threads.participantIds` (array), optional `propertyId`. `messages` FK `threadId`,
`senderId`, `readBy[]` for read receipts, optional `attachment` + `propertyRef` preview.

### escrow_transactions
FK `propertyId`, `tenantId`, `landlordId`. `status`: pending → held → released / disputed / refunded.
`disputeWindowEnds` = held + 7 days. **Rule:** no `released` before `moveInConfirmed` AND window logic.

### rent_loans
FK `tenantId`. `tenureMonths` 3–6, `interestRate` 5–7%. Requires `kycComplete` + `employmentVerified`.
`repayments[]` schedule for the repayment tracker.

### fraud_reports
FK `propertyId`, optional `matchedPropertyId`. Feeds the admin manual-review queue.

### notifications
FK `userId`. Powers the in-app notification center.

## 3. App Navigation

Primary bottom nav (mobile-first, 5 tabs):

1. **Home** `/` — featured + recent verified listings, role-aware quick actions
2. **Search** `/search` — filters (price, location/LGA, type, furnished, verified-only, agent vs owner)
3. **Saved** `/saved` — favorites
4. **Messages** `/messages` — thread list → `/messages/:threadId`
5. **Profile** `/profile` — account, verification tracker, wallet, role tools

Secondary / contextual routes:

- `/auth/login`, `/auth/signup`, `/auth/forgot`, `/auth/verify` (OTP + BVN/NIN + selfie + progress)
- `/listing/:id` — property detail page (gallery, badges, book inspection, chat)
- `/list-property` — create listing (verified owners only)
- `/inspections` — upcoming + history, reschedule / cancel
- `/wallet` — escrow wallet, transactions, receipts
- `/loans` — Rent Assurance (eligibility, calculator, applications, repayments)
- `/admin` — admin dashboard (users, approvals, fraud, disputes, loans, analytics)

## 4. Scalable / future-ready hooks (already modeled)

- **AI fraud detection** — `Property.fraudScore`, `duplicateOf`, `fraud_reports` queue.
- **Rent financing** — `rent_loans` collection + lender KYC flags.
- **Digital lease signing** — escrow timeline + document attachments in messaging.
- **Escrow wallet** — `escrow_transactions` with status machine + `walletBalance`.
