# Brisa Realty

A luxury-modern listings site for a Manila brokerage — editorial photography, earthy neutrals, and a quiet administrative studio. Guests search condos, houses, and commercial floors, open a listing, check which nights are already held, and send an inquiry. Advisors sign in to manage listings, stay requests, and the inquiry inbox.

This document covers environment setup, production builds, and deployment. Local development uses Prisma + SQLite. Production should use a hosted Postgres (Supabase) so listings, inquiries, and database triggers survive deploys.

## Environment setup

### Prerequisites

- Node.js 20 or later (22 is fine)
- npm 10+
- Git
- Optional: a [Supabase](https://supabase.com) project for hosted Postgres, Auth, and Storage
- Optional: a [Resend](https://resend.com) API key so inquiry alerts leave the machine

SQLite 3.38+ is bundled with the Prisma engine; you do not need a separate database install for local work.

### Install

```bash
git clone <this-repository>
cd brisa-realty
npm install
cp .env.example .env
```

Generate a long `AUTH_SECRET` and `INQUIRY_NOTIFY_SECRET` (for example `openssl rand -base64 32`) before going further.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection. Local default: `file:./dev.db` (file lives next to `prisma/schema.prisma`). Production: your Postgres URL. |
| `AUTH_SECRET` | Yes | Auth.js signing secret. |
| `AUTH_URL` | Yes | Public origin of the app (`http://127.0.0.1:43123` locally). Used for Auth.js and inquiry email links. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for email “Open studio inbox” links. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Local | Demo studio login. Change before `npm run db:setup` if you do not want the defaults. |
| `ADMIN_NOTIFY_EMAIL` | Recommended | Comma-separated advisor inboxes for inquiry alerts. Falls back to `ADMIN_EMAIL`. |
| `INQUIRY_NOTIFY_SECRET` | Production | Shared secret the Postgres trigger sends as `Authorization: Bearer …` to `/api/notify/inquiry`. |
| `MAIL_FROM` | Production mail | Resend-verified from address. |
| `RESEND_API_KEY` | Production mail | If empty, alerts are written to the server log (local mock). |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Enables the Supabase listings/inquiry client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Browser/server anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Admin writes and Storage uploads. Never expose this to the browser. |
| `SUPABASE_DB_URL` | Optional | Direct Postgres URL for `npm run db:migrate:supabase`. |

### First-time local database

```bash
npm run db:setup
```

That pushes the Prisma schema, installs the SQLite `AFTER INSERT` trigger on `Inquiry`, and seeds Manila listings plus the demo admin.

### Run the app

```bash
npm run dev
```

The dev server binds to [http://127.0.0.1:43123](http://127.0.0.1:43123).

Demo studio login:

- Email: `admin@brisarealty.ph`
- Password: `brisa-admin-2026`

## Production build routines

Install dependencies from the lockfile, generate the Prisma client, then compile Next.js:

```bash
npm ci
npx prisma generate
npm run build
```

`postinstall` already runs `prisma generate`; calling it again before `build` is the safe CI pattern when `node_modules` was restored from cache.

Typecheck and lint before a release:

```bash
npx tsc --noEmit
npm run lint
```

Stay-calendar end-to-end (requires the app listening on port 43123):

```bash
npx playwright install chromium   # first machine only
npm run test:e2e
```

Run the compiled server (same host/port as development, override as needed):

```bash
npm run start
```

`next start` serves `.next` — it is not a substitute for `next build`. On a host that should listen on port 80/443, put Nginx/Caddy or your platform proxy in front; keep `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` equal to the public HTTPS origin.

Preview the inquiry email template without sending:

```bash
npm run notify:preview
```

## Deployment guidelines

Use Postgres in production. The local SQLite file is for this machine only; it will not follow serverless deploys and is wiped whenever the instance is replaced.

### Recommended topology

1. **App** — Vercel, or any Node 20 host that can run `next start`.
2. **Database / Auth / Storage** — Supabase project (or another Postgres with the migrations in `supabase/migrations`).
3. **Mail** — Resend (or leave `RESEND_API_KEY` empty until you are ready; the webhook still runs and logs the rendered message).

### Platform environment

Set every variable from the table above on the host. In particular:

- `DATABASE_URL` — Supabase “URI” (or Prisma-compatible Postgres).
- `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` — `https://your-domain`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` for studio uploads.
- `INQUIRY_NOTIFY_SECRET` matching the database webhook secret.
- `ADMIN_NOTIFY_EMAIL` and `RESEND_API_KEY` when you want real mail.

After the first deploy, apply SQL (properties, inquiries, reservations, RLS, storage, inquiry notify trigger):

```bash
npm run db:migrate:supabase
npm run storage:ensure
```

Mark studio users:

```sql
update public.profiles set is_admin = true where id = '<auth user uuid>';
```

Point the inquiry trigger at this deployment:

```sql
update public.notification_config
set
  webhook_url = 'https://your-domain/api/notify/inquiry',
  webhook_secret = '<same value as INQUIRY_NOTIFY_SECRET>',
  updated_at = now()
where id = true;
```

Verify Resend (or the mock log) by submitting the listing inquiry form once.

### Vercel / Node notes

- Build command: `npx prisma generate && next build` (or `npm run build` after generate).
- Output: Next.js App Router (no extra export step).
- Do not commit `.env`, `prisma/*.db`, or `/public/uploads`.
- Allow image hosts already listed in `next.config.ts` (`images.unsplash.com`, `*.supabase.co`). Add your CDN host if you front Storage.
- Health: `GET /` should return 200. Inquiry webhook: `POST /api/notify/inquiry` with `Authorization: Bearer <INQUIRY_NOTIFY_SECRET>`.

### Rollback

Redeploy the previous git SHA. Database migrations in `supabase/migrations` are additive; do not “un-apply” them unless you have a backup. Inquiry alerts fail open: a mail/webhook error is logged and does not roll back the guest’s inquiry row.

## Inquiry email notifications

Every new row on `inquiries` / `Inquiry` is meant to page advisors.

1. **Template** — [`src/utils/inquiry-notification.ts`](src/utils/inquiry-notification.ts) renders subject, text, and HTML from the payload. Preview with `npm run notify:preview`.
2. **Database trigger** — [`supabase/migrations/20260916140000_inquiry_admin_notify.sql`](supabase/migrations/20260916140000_inquiry_admin_notify.sql) installs `on_inquiry_submitted_notify_admins` on Postgres. The function writes `inquiry_notification_outbox` and, when `pg_net` plus `notification_config.webhook_url` are set, `POST`s the payload to `/api/notify/inquiry`.
3. **Webhook** — [`app/api/notify/inquiry/route.ts`](app/api/notify/inquiry/route.ts) checks the shared secret and calls the template/send helper (Resend, or a structured log if no API key).
4. **SQLite local** — `npm run db:notify:ensure` installs `inquiry_notify_admins` on `Inquiry`. SQLite cannot HTTP-post; the trigger writes `InquiryNotificationOutbox` and `createInquiry` flushes it through the same template.

Recipients are `profiles.is_admin` emails (Postgres) union `ADMIN_NOTIFY_EMAIL`.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma + SQLite locally; optional Supabase for listings, inquiries, reservations, admin writes, and Storage
- Auth.js credentials locally; Supabase Auth + `profiles.is_admin` when a project is linked
- Leaflet + OpenStreetMap on listing `coordinates.x` (lng) and `coordinates.y` (lat)
- Playwright stay-calendar suite (`e2e/booking.spec.ts`)

When Supabase keys are set, the homepage pulls listings through `src/lib/supabase/server.ts`. Image uploads go to the public `property-images` bucket via `src/utils/storage.ts`. Otherwise Prisma and `/public/uploads` stay in play.

### Admin middleware

`protectAdminRoute` in `src/lib/supabase/middleware.ts` gates `/admin` and `/admin/:path*`:

1. If Supabase is configured, refresh cookies, call `auth.getUser()`, then read `profiles.is_admin`.
2. Signed-in users without the flag are sent home.
3. Guests go to `/login?next=/admin/...`.
4. If Supabase keys are unset, an Auth.js session cookie is accepted so local studio still works.

## What you can do

- **Home** — editorial hero, SearchFilterEngine (area, category, minimum size)
- **Studio (`/admin/dashboard`)** — stats, PropertyForm, multi-image upload
- **Inquiries (`/admin/inquiries`)** — guest viewing notes
- **Bookings (`/admin/bookings`)** — pending, confirmed, and blocked stays

Seeded holds (September–October 2026) live on High Street Penthouse, Sky Residences, and the structural Makati loft (`00000000-0000-0000-0000-000000000001`, 18→22 Sep). Stay ranges use exclusive end dates.

## Design system

Warm cream and sand surfaces, stone greys, and serif headings are locked in [`tailwind.config.ts`](tailwind.config.ts) (Cormorant for `font-heading` / `font-serif`, Outfit for `font-sans`). Tailwind v4 loads that file through `@config` in `app/globals.css`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run build` | Production Next.js compile |
| `npm run start` | Serve the production build on port 43123 |
| `npm run db:setup` | Push Prisma schema, install the SQLite notify trigger, seed |
| `npm run db:notify:ensure` | Reinstall the local Inquiry → outbox trigger |
| `npm run notify:preview` | Print the inquiry admin email template |
| `npm run db:seed:supabase` | Upsert structural Makati / BGC / New Manila records |
| `npm run db:migrate:supabase` | Apply `supabase/migrations` to hosted Postgres |
| `npm run storage:ensure` | Create/update the public `property-images` bucket |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright stay-calendar suite |

## End-to-end tests

Playwright uses `http://127.0.0.1:43123` as `baseURL`. Start the site, then `npx playwright test`. `e2e/booking.spec.ts` opens the structural Makati loft, asserts the 18–21 Sep 2026 hold (checkout morning of the 22nd still open), and requests an unheld overnight stay.
