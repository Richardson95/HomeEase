# HomeEase 🏠

**Lagos' most trusted rental marketplace** — connecting verified tenants, landlords and agents with verified listings, instant inspection booking, escrow-protected payments and rent financing.

Built with **TypeScript + React + Vite + TailwindCSS**. Fully responsive, mobile-first.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

> No backend needed. The whole data layer (users, listings, escrow, loans, messages…)
> runs in the browser via a persisted Zustand store, so every feature is fully
> interactive. See `SCHEMA.md` for the database model it mirrors.

## Demo accounts

Open the login screen and tap any demo account, or sign in with these emails (any password):

| Role | Email |
|---|---|
| Tenant | `tunde@homeease.ng` |
| Landlord | `ade@homeease.ng` |
| Agent | `emeka@homeease.ng` |
| Admin | `admin@homeease.ng` |

You can also **sign up** to walk the full onboarding + verification flow.

## Features by section

1. **Foundation & Auth** — mobile-first shell, 5-tab nav, role-based dashboards, email/password auth with session persistence, signup with role selection, forgot-password.
2. **Verification** — phone OTP, BVN/NIN (simulated), selfie liveness placeholder, role documents, live progress tracker, verification badges. *Unverified users browse; verified users transact.*
3. **Listings** — create listing (all fields, amenities, furnishing, pet toggle, photo picker), Zillow-style cards, detail page with gallery, save/favorite, search with full filters (price, LGA, type, furnished, verified-only, agent-vs-owner).
4. **Inspection booking** — Airbnb-style date/time picker, instant confirmation, double-booking prevention, upcoming/history, reschedule & cancel.
5. **Messaging** — thread list + real-time-style chat, read receipts, property preview, quick templates, trust labels, attachments.
6. **Escrow wallet** — pay into escrow, status machine (pending → held → released/disputed/refunded), move-in confirmation, 7-day dispute window, receipts, timeline.
7. **Rent Assurance** — eligibility checker, repayment calculator (3–6mo, 5–7%), application + repayment tracker.
8. **AI fraud detection** — duplicate-listing scoring (image + description + address + rent), multi-signal gating to reduce false positives, auto-routing to the admin review queue (`src/lib/fraud.ts`).
9. **Admin dashboard** — analytics overview, listing approvals, fraud queue, user management (suspend), escrow disputes, loan monitoring.

## Project structure

```
src/
  lib/        store.ts (Zustand "backend"), fraud.ts, utils.ts
  data/       mockData.ts (seed)
  types/      index.ts (mirrors SCHEMA.md)
  components/  Layout, Logo, ListingCard, Badge, Toast, Guards, icons…
  pages/       Home, Search, Saved, Messages, Profile, ListingDetail,
               AddListing, Inspections, Wallet, Loans, Admin, auth/*
```
