import { notFound } from "next/navigation";
import { LuxuryPropertyLayout } from "@/src/components/LuxuryPropertyLayout";
import { getPropertyById } from "@/src/lib/listings";
import { listReservationWindows } from "@/src/lib/bookings";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return { title: property?.title ?? "Listing" };
}

export default async function PropertyByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();
  const windows = await listReservationWindows(property.id);

  return <LuxuryPropertyLayout property={property} windows={windows} />;
}
