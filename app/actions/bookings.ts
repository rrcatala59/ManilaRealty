"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/auth-guard";
import {
  createBlockedWindow,
  createStayRequest,
  removeReservation,
  setReservationStatus,
} from "@/src/lib/bookings";
import type { ReservationStatus } from "@/src/types";

export type BookingState = { ok: boolean; error?: string };

function revalidateStay(propertyId: string) {
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function requestStay(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  try {
    const result = await createStayRequest({
      propertyId: String(formData.get("propertyId") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      guestName: String(formData.get("guestName") ?? ""),
      guestEmail: String(formData.get("guestEmail") ?? ""),
    });
    if (result.ok) {
      revalidateStay(String(formData.get("propertyId") ?? ""));
    }
    return result;
  } catch (error) {
    console.error("requestStay", error);
    return { ok: false, error: "We could not hold those dates just now." };
  }
}

export async function blockListingDates(propertyId: string, formData: FormData): Promise<BookingState> {
  await requireAdmin();
  const result = await createBlockedWindow(
    propertyId,
    String(formData.get("startDate") ?? ""),
    String(formData.get("endDate") ?? ""),
    String(formData.get("note") ?? "")
  );
  if (result.ok) revalidateStay(propertyId);
  return result;
}

export async function deleteReservation(propertyId: string, reservationId: string) {
  await requireAdmin();
  await removeReservation(reservationId);
  revalidateStay(propertyId);
}

export async function changeReservationStatus(
  propertyId: string,
  reservationId: string,
  status: ReservationStatus
) {
  await requireAdmin();
  await setReservationStatus(reservationId, status);
  revalidateStay(propertyId);
}
