# Brisa Realty

A luxury-modern listings site for a Manila brokerage — editorial photography, earthy neutrals, and a quiet administrative studio. Inspired by the calm of [Terra Mysa](https://terramysa.com), written for buying homes rather than booking stays.

Guests can search condos, houses, and commercial floors across Metro Manila, open a listing, and send an inquiry tied to that property. Advisors sign in to add, edit, and remove listings.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma + SQLite locally (no cloud database required)
- Optional Supabase client for listings and inquiries (`src/lib/listings.ts`)
- Auth.js credentials for a single admin role
- Leaflet + OpenStreetMap for the map stub

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, PropertyCard grids and InquiryForm writes go through Supabase. Otherwise the same queries use Prisma. Schema for a hosted project lives in `supabase/schema.sql`. Validated payloads and coordinate bounds live in `src/types/index.ts`.

## Run locally

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

The app serves at [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Demo admin

- Email: `admin@brisarealty.ph`
- Password: `brisa-admin-2026`

Change these in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) before re-running `npm run db:setup`.

## What you can do

- **Home** — hero search, featured homes, Manila philosophy
- **Listings** — filters (city, type, price, bedrooms) and sort (newest, price)
- **Detail (`/properties/[id]`)** — gallery frames, specs, amenities, Leaflet map on listing coordinates, sticky inquiry form
- **Studio (`/admin`)** — listing counts, inquiry inbox, property CRUD, image URL or file upload

The Property model includes `isAvailable` and a `Reservation` relation so a booking calendar can land later without a schema rewrite. Reservations are not shown in the UI yet.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run db:setup` | Push schema and seed listings + admin |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
