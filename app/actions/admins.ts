"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/auth-guard";
import { addStudioAdmin, removeStudioAdmin } from "@/src/lib/studio-admins";

export type AdminManageState = { error?: string; success?: string };

export async function addAdministratorAction(
  _prev: AdminManageState,
  formData: FormData
): Promise<AdminManageState> {
  await requireAdmin();
  try {
    await addStudioAdmin(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    revalidatePath("/admin/administrators");
    return { success: "Administrator added. They can sign in at /login." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add that administrator." };
  }
}

export async function removeAdministratorAction(formData: FormData) {
  const actor = await requireAdmin();
  const targetId = String(formData.get("id") ?? "");
  try {
    await removeStudioAdmin(targetId, actor.id);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not remove that administrator.");
  }
  revalidatePath("/admin/administrators");
}
