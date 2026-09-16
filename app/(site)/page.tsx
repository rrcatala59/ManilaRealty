import Image from "next/image";
import Link from "next/link";
import { SearchFilterEngine } from "@/src/components/SearchFilterEngine";
import { fetchHomeProperties } from "@/src/lib/listings";
import { formatPHP } from "@/lib/format";
import type { PropertyRecord } from "@/src/types";
import { getOptimizedImageUrl } from "@/src/utils/imageLoader";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

const PHILOSOPHY = [
  {
    num: "01",
    title: "Intentional spaces",
    body: "We show fewer homes, chosen for light, plan, and the way Manila actually lives — not for a brochure moment.",
  },
  {
    num: "02",
    title: "Manila footprint",
    body: "Makati, BGC, New Manila, Quezon City, Pasig, Pasay, Alabang. Advisors who walk the buildings they recommend.",
  },
  {
    num: "03",
    title: "Quiet counsel",
    body: "No pressure tours. Clear numbers, honest trade-offs, and a pace that leaves room to decide.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let listings: PropertyRecord[] = [];
  let loadError: string | null = null;
  try {
    listings = await fetchHomeProperties();
  } catch {
    loadError = "Listings could not be refreshed just now. The catalogue below may be incomplete.";
  }

  const hero = listings.find((item) => item.isFeatured && item.images[0]) ?? listings.find((item) => item.images[0]);
  const heroImage = hero?.images[0] ?? FALLBACK_HERO;
  const districts = [...new Set(listings.map((item) => item.city))];

  return (
    <>
      <section className="relative min-h-[88vh] text-primary-foreground">
        <Image
          src={getOptimizedImageUrl({ url: heroImage, width: 1920, quality: 80 })}
          alt={hero ? hero.title : "Manila skyline"}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/40 to-black/20" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end gap-10 px-5 pb-20 pt-28 md:px-8 md:pb-24">
          <div className="max-w-3xl">
            <p className="text-[11px] tracking-[0.32em] uppercase text-white/70">Manila · Private brokerage</p>
            <h1 className="font-heading mt-4 text-5xl leading-[0.95] text-white md:text-7xl">
              A home to arrive in, not just to own.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              Considered condos, houses, and commercial floors — sourced quietly from the server catalogue, presented
              without noise. Filter by area, category, and size as you browse.
            </p>
            {hero ? (
              <Link
                href={`/properties/${hero.id}`}
                className="mt-8 inline-flex flex-col gap-1 text-white/85 transition-opacity hover:opacity-70"
              >
                <span className="text-[10px] tracking-[0.22em] uppercase text-white/55">Now showing</span>
                <span className="font-heading text-2xl md:text-3xl">{hero.title}</span>
                <span className="text-sm text-white/70">
                  {hero.city} · {formatPHP(hero.price)}
                </span>
              </Link>
            ) : null}
          </div>
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-[11px] tracking-[0.2em] uppercase text-white/65">
            <div>
              <dt className="text-white/40">Homes</dt>
              <dd className="mt-1 text-white">{listings.length || "—"}</dd>
            </div>
            <div>
              <dt className="text-white/40">Districts</dt>
              <dd className="mt-1 text-white">{districts.length ? districts.join(" · ") : "Metro Manila"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {loadError ? (
        <p className="mx-auto max-w-7xl px-5 pt-8 text-sm text-destructive md:px-8">{loadError}</p>
      ) : null}

      {listings.length === 0 && !loadError ? (
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">Catalogue</p>
          <h2 className="font-heading mt-2 text-4xl">No homes on the floor yet</h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            When the server catalogue is seeded, they will appear here with live area, category, and size filters.
          </p>
        </section>
      ) : (
        <SearchFilterEngine initialProperties={listings} />
      )}

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">Philosophy</p>
            <h2 className="font-heading mt-3 text-4xl md:text-5xl">Built on intention. Rooted in Manila.</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Brisa began as a small Makati practice for families who wanted the CBD without the circus. We still
              work that way: fewer listings, longer conversations, and a map of the city we actually know.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-block text-[11px] tracking-[0.22em] uppercase underline underline-offset-4"
            >
              Read our story
            </Link>
          </div>
          <ol className="space-y-10">
            {PHILOSOPHY.map((item) => (
              <li key={item.num} className="grid grid-cols-[auto_1fr] gap-5">
                <span className="font-heading text-3xl text-stone-warm">{item.num}</span>
                <div>
                  <h3 className="font-heading text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
