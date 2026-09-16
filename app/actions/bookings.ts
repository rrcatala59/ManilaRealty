"use server";

import { revalidatePath } from "next/cache";
import { createStayRequest } from "@/src/lib/bookings";

export type BookingState = { ok: boolean; error?: string };

export async function requestStay(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const result = await createStayRequest({
    propertyId: String(formData.get("propertyId") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    guestName: String(formData.get("guestName") ?? ""),
    guestEmail: String(formData.get("guestEmail") ?? ""),
  });
  if (result.ok) {
    const propertyId = String(formData.get("propertyId") ?? "");
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/properties");
    revalidatePath("/admin/bookings");
  }
  return result;
}
