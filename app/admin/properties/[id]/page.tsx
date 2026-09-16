import { notFound } from "next/navigation";
import { PropertyForm } from "@/src/components/PropertyForm";
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

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Edit</p>
      <h1 className="font-heading mt-1 mb-8 text-4xl">{property.title}</h1>
      <PropertyForm property={property} />
    </div>
  );
}
