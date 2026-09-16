"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth-guard";
import { removeProperty, upsertProperty } from "@/src/lib/admin";

function revalidateListings() {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/properties");
}

export async function saveProperty(id: string | null, formData: FormData) {
  await requireAdmin();
  const property = await upsertProperty(id, formData);
  revalidateListings();
  revalidatePath(`/properties/${property.id}`);
  redirect("/admin/dashboard");
}

export async function createProperty(formData: FormData) {
  await saveProperty(null, formData);
}

export async function updateProperty(id: string, formData: FormData) {
  await saveProperty(id, formData);
}

export async function deleteProperty(id: string) {
  await requireAdmin();
  await removeProperty(id);
  revalidateListings();
  redirect("/admin/dashboard");
}
