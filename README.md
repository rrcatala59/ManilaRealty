# Brisa Realty

A luxury-modern listings site for a Manila brokerage — editorial photography, earthy neutrals, and a quiet administrative studio. Inspired by the calm of [Terra Mysa](https://terramysa.com), written for buying homes rather than booking stays.

Guests can search condos, houses, and commercial floors across Metro Manila, open a listing, and send an inquiry tied to that property. Advisors sign in to add, edit, and remove listings.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma + SQLite locally (no cloud database required)
- Optional Supabase client for listings, inquiries, admin writes, and Storage uploads
- Auth.js credentials locally; Supabase Auth + `profiles.is_admin` when a project is linked
- Leaflet + OpenStreetMap for the map stub
- Middleware on `/admin/*` redirects guests to `/login`

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, listings and inquiries go through Supabase. Admin image uploads use the `property-images` Storage bucket if `SUPABASE_SERVICE_ROLE_KEY` is present. Otherwise Prisma + local `/uploads` stay in play.

Apply the remote schema with `SUPABASE_DB_URL` (Project Settings → Database):

```bash
npm run db:migrate:supabase
```

That runs [`supabase/migrations/20260916120000_init_brisa.sql`](supabase/migrations/20260916120000_init_brisa.sql): `properties`, `inquiries`, `reservations`, `profiles.is_admin`, RLS, and the public Storage bucket. Then mark your Auth user as an advisor:

```sql
update public.profiles set is_admin = true where id = '<auth user uuid>';
```

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
- **Studio (`/admin/dashboard`)** — stats, create/edit PropertyForm, multi-image upload, inquiry inbox

The Property model includes `isAvailable` and a `Reservation` relation so a booking calendar can land later without a schema rewrite. Reservations are not shown in the UI yet.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run db:migrate:supabase` | Apply RLS schema to a hosted Supabase project |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
