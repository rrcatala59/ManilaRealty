"use server";

import { revalidatePath } from "next/cache";
import { createInquiry } from "@/src/lib/listings";

export type InquiryState = { ok: boolean; error?: string };

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const result = await createInquiry({
    propertyId: String(formData.get("propertyId") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
  }
  return result;
}
