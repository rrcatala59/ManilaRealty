"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type InquiryState = { ok: boolean; error?: string };

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const propertyId = String(formData.get("propertyId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!propertyId || !name || !email || !phone || !message) {
    return { ok: false, error: "Please complete every field." };
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return { ok: false, error: "That listing is no longer available." };
  }

  await prisma.inquiry.create({
    data: { propertyId, name, email, phone, message },
  });

  revalidatePath("/admin");
  return { ok: true };
}
