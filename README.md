# Brisa Realty

A luxury-modern listings site for a Manila brokerage — editorial photography, earthy neutrals, and a quiet administrative studio. Inspired by the calm of [Terra Mysa](https://terramysa.com), written for buying homes rather than booking stays — with a stay calendar on each listing so advisors can still hold viewing nights.

Guests can search condos, houses, and commercial floors across Metro Manila, open a listing, check which nights are already held, and send an inquiry. Advisors sign in to add, edit, and remove listings and to review stay requests.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma + SQLite locally (no cloud database required)
- Optional Supabase client for listings, inquiries, reservations, admin writes, and Storage uploads
- Auth.js credentials locally; Supabase Auth + `profiles.is_admin` when a project is linked
- Leaflet + OpenStreetMap for the map stub
- Next.js middleware on `/admin` and `/admin/:path*` (see `src/lib/supabase/auth-config.ts`)

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, listings, inquiries, and reservation windows go through Supabase. Admin image uploads use the `property-images` Storage bucket if `SUPABASE_SERVICE_ROLE_KEY` is present. Otherwise Prisma + local `/uploads` stay in play.

### Admin middleware

`protectAdminRoute` in `src/lib/supabase/middleware.ts` is the gate for every `/admin` URL:

1. If Supabase is configured, refresh cookies via `@supabase/ssr`, call `auth.getUser()`, then read `profiles.is_admin`.
2. Signed-in users without the admin flag are sent home (`forbiddenPath`).
3. Guests are sent to `/login?next=/admin/...`.
4. If Supabase keys are unset, an Auth.js session cookie (`authjs.session-token`) is accepted so local studio still works.

Apply the remote schema with `SUPABASE_DB_URL` (Project Settings → Database):

```bash
npm run db:migrate:supabase
```

That runs every file in [`supabase/migrations`](supabase/migrations): `properties`, `inquiries`, `reservations` (with guest name/email), `profiles.is_admin`, RLS, public stay-request policies, and the public Storage bucket. Then mark your Auth user as an advisor:

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
- **Detail (`/properties/[id]`)** — gallery, specs, amenities, stay calendar against reservation windows (checkout morning is exclusive), Leaflet map, sticky inquiry form
- **Studio (`/admin/dashboard`)** — stats, create/edit PropertyForm, multi-image upload
- **Bookings (`/admin/bookings`)** — pending, confirmed, and blocked stays

Seeded holds (September–October 2026) live on High Street Penthouse and Sky Residences so the calendar has blocked nights on first load.

Stay ranges use exclusive end dates: a confirmed window `2026-09-20` → `2026-09-24` occupies the nights of the 20th–23rd; the 24th morning is free for checkout or a new check-in.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run db:setup` | Push Prisma schema and seed listings, admin, and sample stays |
| `npm run db:migrate:supabase` | Apply RLS schema to a hosted Supabase project |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
