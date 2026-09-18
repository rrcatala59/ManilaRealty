import { notFound } from "next/navigation";
import { AdminBlockedDates } from "@/src/components/AdminBlockedDates";
import { PropertyForm } from "@/src/components/PropertyForm";
import { listPropertyReservations, listReservationWindows } from "@/src/lib/bookings";
import { getPropertyById } from "@/src/lib/listings";

export const metadata = {
  title: "Edit listing",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();
  const [windows, reservations] = await Promise.all([
    listReservationWindows(property.id),
    listPropertyReservations(property.id),
  ]);

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Edit</p>
      <h1 className="font-heading mt-1 mb-8 text-4xl">{property.title}</h1>
      <PropertyForm property={property} />
      <AdminBlockedDates propertyId={property.id} windows={windows} reservations={reservations} />
    </div>
  );
}
