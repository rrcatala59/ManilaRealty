import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Inquiries",
};

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Inbox</p>
      <h1 className="font-heading mt-1 text-4xl">Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No inquiries yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">
                  {inquiry.name} · {inquiry.email} · {inquiry.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inquiry.createdAt.toLocaleString("en-PH")}
                </p>
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {inquiry.property.title} · ID {inquiry.propertyId}
              </p>
              <p className="mt-3 text-sm leading-relaxed">{inquiry.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
