import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/src/lib/supabase";
import { getPropertyById } from "@/src/lib/listings";
import {
  bookingRequestSchema,
  datesOverlap,
  toDateKey,
  type BookingRequest,
  type ReservationStatus,
  type ReservationWindow,
} from "@/src/types";

const BLOCKING: ReservationStatus[] = ["pending", "confirmed", "blocked"];

function asWindow(row: Record<string, unknown>): ReservationWindow {
  return {
    id: String(row.id),
    propertyId: String(row.propertyId ?? row.property_id ?? ""),
    startDate: toDateKey(String(row.startDate ?? row.start_date)),
    endDate: toDateKey(String(row.endDate ?? row.end_date)),
    status: BLOCKING.includes(row.status as ReservationStatus)
      ? (row.status as ReservationStatus)
      : "pending",
  };
}

export async function listReservationWindows(propertyId: string): Promise<ReservationWindow[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("reservations")
      .select("id, property_id, start_date, end_date, status")
      .eq("property_id", propertyId)
      .in("status", BLOCKING);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => asWindow(row as Record<string, unknown>));
  }

  const rows = await prisma.reservation.findMany({
    where: { propertyId, status: { in: BLOCKING } },
    orderBy: { startDate: "asc" },
  });
  return rows.map((row) => asWindow(row as unknown as Record<string, unknown>));
}

export function isRangeOpen(
  startDate: string,
  endDate: string,
  windows: ReservationWindow[]
) {
  if (endDate <= startDate) return false;
  return !windows.some((window) => datesOverlap(startDate, endDate, window.startDate, window.endDate));
}

export async function createStayRequest(raw: BookingRequest | Record<string, string>) {
  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please check the dates." };
  }

  const { propertyId, startDate, endDate, guestName, guestEmail } = parsed.data;
  if (endDate <= startDate) {
    return { ok: false as const, error: "Check-out must be after check-in." };
  }

  const property = await getPropertyById(propertyId);
  if (!property) {
    return { ok: false as const, error: "That listing is no longer available." };
  }
  if (!property.isAvailable || property.status !== "AVAILABLE") {
    return { ok: false as const, error: "This home is not open for stays." };
  }

  const windows = await listReservationWindows(propertyId);
  if (!isRangeOpen(startDate, endDate, windows)) {
    return { ok: false as const, error: "Those dates are already held." };
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("reservations").insert({
      property_id: propertyId,
      start_date: startDate,
      end_date: endDate,
      guest_name: guestName,
      guest_email: guestEmail,
      status: "pending",
    });
    if (error) return { ok: false as const, error: "We could not hold those dates just now." };
    return { ok: true as const };
  }

  await prisma.reservation.create({
    data: {
      propertyId,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: new Date(`${endDate}T00:00:00.000Z`),
      guestName,
      guestEmail,
      status: "pending",
    },
  });
  return { ok: true as const };
}

export async function listAllReservations() {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("reservations")
      .select("id, property_id, start_date, end_date, status, guest_name, guest_email, properties(title)")
      .order("start_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: String(row.id),
      propertyId: String(row.property_id),
      propertyTitle: String((row.properties as { title?: string } | null)?.title ?? "Listing"),
      startDate: toDateKey(String(row.start_date)),
      endDate: toDateKey(String(row.end_date)),
      status: String(row.status),
      guestName: String(row.guest_name ?? ""),
      guestEmail: String(row.guest_email ?? ""),
    }));
  }

  const rows = await prisma.reservation.findMany({
    orderBy: { startDate: "asc" },
    include: { property: { select: { title: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.property.title,
    startDate: toDateKey(row.startDate),
    endDate: toDateKey(row.endDate),
    status: row.status,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
  }));
}
