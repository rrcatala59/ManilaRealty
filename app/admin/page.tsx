import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Studio",
};

export default async function AdminHomePage() {
  const [listings, available, inquiries, recent] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.inquiry.count(),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { property: { select: { title: true, slug: true } } },
    }),
  ]);

  const stats = [
    { label: "Total listings", value: listings },
    { label: "Available", value: available },
    { label: "Inquiries", value: inquiries },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Dashboard</p>
          <h1 className="font-heading mt-1 text-4xl">Studio overview</h1>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-primary px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase text-primary-foreground"
        >
          New listing
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{stat.label}</p>
            <p className="font-heading mt-2 text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-12">
        <h2 className="font-heading text-3xl">Recent inquiries</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No messages yet. They will appear here as guests write in.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border bg-card">
            {recent.map((inquiry) => (
              <li key={inquiry.id} className="px-5 py-4">
                <p className="text-sm font-medium">
                  {inquiry.name} · {inquiry.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {inquiry.property.title} · {inquiry.createdAt.toLocaleString("en-PH")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{inquiry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
