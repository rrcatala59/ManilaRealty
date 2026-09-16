# Brisa Realty

A luxury-modern listings site for a Manila brokerage — editorial photography, earthy neutrals, and a quiet administrative studio. Inspired by the calm of [Terra Mysa](https://terramysa.com), written for buying homes rather than booking stays — with a stay calendar on each listing so advisors can still hold viewing nights.

Guests can search condos, houses, and commercial floors across Metro Manila, open a listing, check which nights are already held, and send an inquiry. Advisors sign in to add, edit, and remove listings and to review stay requests.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma + SQLite locally (no cloud database required)
- Optional Supabase client for listings, inquiries, reservations, admin writes, and Storage uploads
- Auth.js credentials locally; Supabase Auth + `profiles.is_admin` when a project is linked
- Leaflet + OpenStreetMap, centred on listing `coordinates.x` (lng) and `coordinates.y` (lat)
- Global `Header` / `Footer` in the root App Router layout (`app/layout.tsx`)
- Next.js middleware on `/admin` and `/admin/:path*` (see `src/lib/supabase/auth-config.ts`)

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the homepage pulls the property array through a cookie-aware server client (`src/lib/supabase/server.ts`). Listings, inquiries, and reservation windows use the same project. Admin image uploads go to the public `property-images` Storage bucket (see `src/utils/storage.ts`) if `SUPABASE_SERVICE_ROLE_KEY` is present. Otherwise Prisma + local `/uploads` stay in play.

Create or update that bucket and its RLS with:

```bash
npm run storage:ensure
npm run db:migrate:supabase
```

The bucket is public-read. Insert, update, and delete require an authenticated user with `profiles.is_admin`, matching the `/admin` middleware.

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

- **Home** — high-end hero from the live catalogue, SearchFilterEngine (area, category, minimum size)
- **Studio (`/admin/dashboard`)** — stats, create/edit PropertyForm, multi-image upload via `src/utils/storage.ts`
- **Bookings (`/admin/bookings`)** — pending, confirmed, and blocked stays

Seeded holds (September–October 2026) live on High Street Penthouse, Sky Residences, and the structural Makati loft (`00000000-0000-0000-0000-000000000001`, 18→22 Sep). `npm run db:seed:supabase` upserts Makati, BGC, and New Manila test homes into the local Prisma database.

Stay ranges use exclusive end dates: a confirmed window `2026-09-20` → `2026-09-24` occupies the nights of the 20th–23rd; the 24th morning is free for checkout or a new check-in.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run db:setup` | Push Prisma schema and seed listings, admin, and sample stays |
| `npm run db:seed:supabase` | Upsert structural Makati / BGC / New Manila records via `supabase/seed.ts` |
| `npm run db:migrate:supabase` | Apply RLS schema to a hosted Supabase project |
| `npm run storage:ensure` | Create/update the public `property-images` Storage bucket |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
