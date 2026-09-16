import Link from "next/link";
import { auth } from "@/auth";

const links = [
  { href: "/properties", label: "Listings" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="leading-none">
          <span className="font-heading text-[1.65rem] tracking-[0.22em] text-foreground">
            BRISA
          </span>
          <span className="mt-0.5 block text-[10px] tracking-[0.42em] text-muted-foreground">
            REALTY
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-[11px] tracking-[0.22em] uppercase text-foreground/80 md:gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-60">
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <Link href="/admin/dashboard" className="transition-opacity hover:opacity-60">
              Admin
            </Link>
          ) : (
            <Link href="/login" className="transition-opacity hover:opacity-60">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
