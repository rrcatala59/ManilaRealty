import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/properties", label: "Listings" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/admin" className="font-heading text-xl tracking-[0.18em]">
            BRISA · Studio
          </Link>
          <nav className="flex items-center gap-5 text-[11px] tracking-[0.18em] uppercase">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:opacity-60">
                {item.label}
              </Link>
            ))}
            <Link href="/" className="hover:opacity-60">
              Site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="hover:opacity-60">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</div>
    </div>
  );
}
