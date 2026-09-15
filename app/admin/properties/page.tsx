import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPHP, typeLabel } from "@/lib/format";
import { deleteProperty } from "@/app/actions/properties";

export const metadata = {
  title: "Listings",
};

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Catalogue</p>
          <h1 className="font-heading mt-1 text-4xl">Listings</h1>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-primary px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase text-primary-foreground"
        >
          Add property
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{property.title}</td>
                <td className="px-4 py-3">{property.city}</td>
                <td className="px-4 py-3">{typeLabel(property.type)}</td>
                <td className="px-4 py-3">{formatPHP(property.price)}</td>
                <td className="px-4 py-3">{property.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/properties/${property.id}`} className="underline underline-offset-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
