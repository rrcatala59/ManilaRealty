import { prisma } from "@/lib/prisma";
import { getServiceSupabase, getSupabase } from "@/src/lib/supabase";
import { createServerSupabase } from "@/src/lib/supabase/server";
import { getPropertyById } from "@/src/lib/listings";
import {
  bookingRequestSchema,
  datesOverlap,
  isStayOffering,
  toDateKey,
  type BookingRequest,
  type ReservationStatus,
  type ReservationWindow,
} from "@/src/types";

async function writeClient() {
  return getServiceSupabase() ?? (await createServerSupabase()) ?? getSupabase();
}

function utcDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Please choose valid check-in and check-out dates.");
  }
  return date;
}

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
  if (!property.isAvailable || property.status !== "AVAILABLE" || !isStayOffering(property.offering)) {
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

  try {
    await prisma.reservation.create({
      data: {
        propertyId,
        startDate: utcDateOnly(startDate),
        endDate: utcDateOnly(endDate),
        guestName,
        guestEmail,
        status: "pending",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Please choose")) {
      return { ok: false as const, error: error.message };
    }
    console.error("createStayRequest", error);
    return { ok: false as const, error: "We could not hold those dates just now." };
  }
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

export type StudioReservation = Awaited<ReturnType<typeof listAllReservations>>[number];

export async function listPropertyReservations(propertyId: string): Promise<StudioReservation[]> {
  const all = await listAllReservations();
  return all.filter((row) => row.propertyId === propertyId && row.status !== "cancelled");
}

export async function createBlockedWindow(propertyId: string, startDate: string, endDate: string, note?: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate <= startDate) {
    return { ok: false as const, error: "Choose a check-in and a later check-out." };
  }

  const property = await getPropertyById(propertyId);
  if (!property) return { ok: false as const, error: "Listing not found." };

  const windows = await listReservationWindows(propertyId);
  if (!isRangeOpen(startDate, endDate, windows)) {
    return { ok: false as const, error: "Those dates already overlap a hold." };
  }

  const guestName = (note ?? "Studio hold").trim().slice(0, 80) || "Studio hold";
  const supabase = await writeClient();
  if (supabase) {
    const { error } = await supabase.from("reservations").insert({
      property_id: propertyId,
      start_date: startDate,
      end_date: endDate,
      guest_name: guestName,
      guest_email: "studio@brisarealty.ph",
      status: "blocked",
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  }

  await prisma.reservation.create({
    data: {
      propertyId,
      startDate: utcDateOnly(startDate),
      endDate: utcDateOnly(endDate),
      guestName,
      guestEmail: "studio@brisarealty.ph",
      status: "blocked",
    },
  });
  return { ok: true as const };
}

export async function removeReservation(id: string) {
  const supabase = await writeClient();
  if (supabase) {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await prisma.reservation.delete({ where: { id } });
}

export async function setReservationStatus(id: string, status: ReservationStatus) {
  const supabase = await writeClient();
  if (supabase) {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await prisma.reservation.update({ where: { id }, data: { status } });
}
