export const metadata = {
  title: "About",
};

const districts = [
  { name: "Makati", note: "Salcedo, Legazpi, Rockwell, Ayala." },
  { name: "BGC & Taguig", note: "High Street, Uptown, McKinley West." },
  { name: "Quezon City", note: "Eastwood, Tomas Morato, live-work lofts." },
  { name: "Pasig & Pasay", note: "Ortigas floors, Capitol Commons, Newport." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">About Brisa</p>
          <h1 className="font-heading mt-4 text-5xl leading-tight md:text-6xl">
            Built on intention. Rooted in care.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Brisa Realty is a Manila brokerage for people who want a home that still feels like one after the
            keys are handed over. We work slowly on purpose.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-heading text-4xl">How it started</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            The practice opened in Legazpi Village with a single rule: do not list a building we would not
            recommend to family. What began as a handful of Makati condos is now a citywide catalogue — still
            edited, still walked, still small enough that every inquiry reaches a person.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-4xl">Where we work</h2>
          <ul className="mt-6 space-y-5">
            {districts.map((district) => (
              <li key={district.name} className="border-b border-border pb-4">
                <p className="font-heading text-2xl">{district.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{district.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
