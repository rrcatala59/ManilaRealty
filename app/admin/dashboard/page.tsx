import Link from "next/link";
import { AdminBlockedDates } from "@/src/components/AdminBlockedDates";
import { PropertyForm } from "@/src/components/PropertyForm";
import { getDashboardStats, listAdminProperties } from "@/src/lib/admin";
import { listPropertyReservations, listReservationWindows } from "@/src/lib/bookings";
import { getPropertyById } from "@/src/lib/listings";
import { formatPHP } from "@/lib/format";
import { deleteProperty } from "@/app/actions/properties";

export const metadata = {
  title: "Studio dashboard",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [stats, properties, editing] = await Promise.all([
    getDashboardStats(),
    listAdminProperties(),
    edit ? getPropertyById(edit) : Promise.resolve(null),
  ]);
  const stayWindows = editing ? await listReservationWindows(editing.id) : [];
  const stayRows = editing ? await listPropertyReservations(editing.id) : [];

  const cards = [
    { label: "Total listings", value: stats.listings },
    { label: "Available", value: stats.available },
    { label: "Inquiries", value: stats.inquiries },
  ];

  return (
    <div className="space-y-14">
      <section>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Dashboard</p>
        <h1 className="font-heading mt-1 text-4xl">Studio overview</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-6">
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{stat.label}</p>
              <p className="font-heading mt-2 text-4xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
            {editing ? "Edit listing" : "Create listing"}
          </p>
          <h2 className="font-heading mt-1 mb-6 text-3xl">
            {editing ? editing.title : "New property"}
          </h2>
          <PropertyForm key={editing?.id ?? "create"} property={editing ?? undefined} />
          {editing ? (
            <AdminBlockedDates propertyId={editing.id} windows={stayWindows} reservations={stayRows} />
          ) : null}
        </div>
        <aside>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Catalogue</p>
          <h2 className="font-heading mt-1 mb-4 text-2xl">Listings</h2>
          <ul className="divide-y divide-border border border-border bg-card">
            {properties.map((property) => (
              <li key={property.id} className="px-4 py-3">
                <p className="text-sm font-medium">{property.title}</p>
                <p className="text-xs text-muted-foreground">
                  {property.city} · {formatPHP(property.price)}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <Link href={`/admin/dashboard?edit=${property.id}`} className="underline underline-offset-2">
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteProperty(property.id);
                    }}
                  >
                    <button type="submit" className="text-destructive underline underline-offset-2">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section>
        <h2 className="font-heading text-3xl">Recent inquiries</h2>
        {stats.recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No messages yet. They will appear here as guests write in.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border bg-card">
            {stats.recent.map((inquiry) => (
              <li key={inquiry.id} className="px-5 py-4">
                <p className="text-sm font-medium">
                  {inquiry.name} · {inquiry.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {inquiry.propertyTitle} · {new Date(inquiry.createdAt).toLocaleString("en-PH")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{inquiry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
