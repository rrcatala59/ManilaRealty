import Image from "next/image";
import Link from "next/link";
import { SearchFilterEngine } from "@/src/components/SearchFilterEngine";
import { listProperties } from "@/src/lib/listings";

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
    body: "Makati, BGC, New Manila, Quezon City, Pasig, Pasay, Alabang. Advisors who walk the buildings they recommend.",
  },
  {
    num: "03",
    title: "Quiet counsel",
    body: "No pressure tours. Clear numbers, honest trade-offs, and a pace that leaves room to decide.",
  },
];

export default async function HomePage() {
  const listings = await listProperties();

  return (
    <>
      <section className="relative min-h-[78vh] text-primary-foreground">
        <Image src={HERO} alt="Manila skyline" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end gap-10 px-5 pb-20 pt-28 md:px-8 md:pb-24">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.32em] uppercase text-white/70">Manila · Private brokerage</p>
            <h1 className="font-heading mt-4 text-5xl leading-[0.95] text-white md:text-7xl">
              A home to arrive in, not just to own.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              Considered condos, houses, and commercial floors across Metro Manila — sourced quietly, presented
              without noise. Filter by area, category, and size as you browse.
            </p>
          </div>
        </div>
      </section>

      <SearchFilterEngine initialProperties={listings} />

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
