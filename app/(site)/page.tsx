import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";

const HERO =
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
    body: "Makati, BGC, Quezon City, Pasig, Pasay, Alabang. Advisors who walk the buildings they recommend.",
  },
  {
    num: "03",
    title: "Quiet counsel",
    body: "No pressure tours. Clear numbers, honest trade-offs, and a pace that leaves room to decide.",
  },
];

export default async function HomePage() {
  const featured = await prisma.property.findMany({
    where: { isFeatured: true },
    orderBy: { price: "desc" },
    take: 6,
  });

  return (
    <>
      <section className="relative min-h-[88vh] text-primary-foreground">
        <Image src={HERO} alt="Manila skyline" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end gap-10 px-5 pb-16 pt-28 md:px-8 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.32em] uppercase text-white/70">Manila · Private brokerage</p>
            <h1 className="font-heading mt-4 text-5xl leading-[0.95] text-white md:text-7xl">
              A home to arrive in, not just to own.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              Considered condos, houses, and commercial floors across Metro Manila — sourced quietly, presented
              without noise.
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">Featured</p>
            <h2 className="font-heading mt-2 text-4xl md:text-5xl">Homes currently in play</h2>
          </div>
          <Link href="/properties" className="text-[11px] tracking-[0.22em] uppercase underline underline-offset-4">
            View all listings
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="mt-12 text-muted-foreground">No featured listings yet. Check the full catalogue.</p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

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
