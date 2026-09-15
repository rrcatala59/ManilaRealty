import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-heading text-3xl tracking-[0.18em]">BRISA</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Homes with quiet confidence. A Manila brokerage for buyers who prefer
            considered spaces over spectacle.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[11px] tracking-[0.28em] uppercase text-primary-foreground/50">
            Visit
          </p>
          <p className="mt-3 leading-relaxed text-primary-foreground/80">
            8th Floor, Salcedo Tower
            <br />
            Legazpi Village, Makati
            <br />
            Metro Manila, Philippines
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[11px] tracking-[0.28em] uppercase text-primary-foreground/50">
            Connect
          </p>
          <div className="mt-3 flex flex-col gap-2 text-primary-foreground/80">
            <Link href="/properties" className="hover:text-primary-foreground">
              Browse listings
            </Link>
            <Link href="/about" className="hover:text-primary-foreground">
              Our philosophy
            </Link>
            <a href="mailto:hello@brisarealty.ph" className="hover:text-primary-foreground">
              hello@brisarealty.ph
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-5 py-5 text-center text-[11px] tracking-[0.18em] uppercase text-primary-foreground/45 md:px-8">
        © {new Date().getFullYear()} Brisa Realty · Manila
      </div>
    </footer>
  );
}
