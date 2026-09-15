import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/property-form";
import { updateProperty } from "@/app/actions/properties";

export const metadata = {
  title: "Edit listing",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) notFound();

  const action = updateProperty.bind(null, property.id);

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Edit</p>
      <h1 className="font-heading mt-1 mb-8 text-4xl">{property.title}</h1>
      <PropertyForm property={property} action={action} />
    </div>
  );
}
