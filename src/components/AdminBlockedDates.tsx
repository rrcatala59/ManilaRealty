"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockListingDates, deleteReservation } from "@/app/actions/bookings";
import { addMonths, formatStayDay, nightsBetween } from "@/src/lib/stay-dates";
import { MonthPager, StayMonthGrid, isRangeClear } from "@/src/components/StayMonthGrid";
import type { ReservationWindow } from "@/src/types";
import type { StudioReservation } from "@/src/lib/bookings";

export function AdminBlockedDates({
  propertyId,
  windows,
  reservations,
}: {
  propertyId: string;
  windows: ReservationWindow[];
  reservations: StudioReservation[];
}) {
  const now = new Date();
  const [{ year, month }, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = addMonths(year, month, 1);
  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : 0;
  const available = Boolean(startDate && endDate && nights > 0 && isRangeClear(startDate, endDate, windows));

  function selectDay(key: string) {
    const pickingCheckout = Boolean(startDate && !endDate && key > startDate);
    if (pickingCheckout && isRangeClear(startDate!, key, windows)) {
      setEndDate(key);
      setError(null);
      return;
    }
    const occupied = windows.some((window) => key >= window.startDate && key < window.endDate);
    if (occupied) {
      setError("That night is already booked. Remove the hold below first.");
      return;
    }
    setStartDate(key);
    setEndDate(null);
    setError(null);
  }

  async function markBooked(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await blockListingDates(propertyId, formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save those dates.");
      return;
    }
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <section className="mt-10 border border-border bg-card p-6">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Availability</p>
      <h2 className="font-heading mt-1 text-3xl">Booked dates</h2>
      <p className="mt-2 mb-5 max-w-xl text-sm text-muted-foreground">
        Mark nights that are already taken. Guests see them instantly as unavailable when they pick a range.
      </p>

      <MonthPager year={year} month={month} onChange={setCursor} />
      <div className="grid gap-8 md:grid-cols-2">
        <StayMonthGrid
          year={year}
          month={month}
          windows={windows}
          startDate={startDate}
          endDate={endDate}
          onSelect={selectDay}
          allowPast
        />
        <StayMonthGrid
          year={next.year}
          month={next.month}
          windows={windows}
          startDate={startDate}
          endDate={endDate}
          onSelect={selectDay}
          allowPast
        />
      </div>

      <form action={markBooked} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="startDate" value={startDate ?? ""} />
        <input type="hidden" name="endDate" value={endDate ?? ""} />
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="note">Label (optional)</Label>
          <Input id="note" name="note" placeholder="Owner occupancy, renovation…" className="h-11 rounded-sm" />
        </div>
        <Button type="submit" disabled={!available || pending} className="h-11 rounded-sm">
          {pending ? "Saving…" : "Mark these dates booked"}
        </Button>
      </form>
      <p className="mt-3 text-sm" data-availability={startDate && endDate ? (available ? "open" : "blocked") : "pending"}>
        {startDate && endDate
          ? available
            ? `${formatStayDay(startDate)} → ${formatStayDay(endDate)} · ${nights} ${nights === 1 ? "night" : "nights"} free to block`
            : "That range overlaps an existing hold."
          : "Select a start night, then the first free morning after the stay."}
      </p>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      <ul className="mt-6 divide-y divide-border border border-border">
        {reservations.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted-foreground">No booked windows yet.</li>
        ) : (
          reservations.map((stay) => (
            <li key={stay.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p>
                  {stay.startDate} → {stay.endDate}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stay.status} · {stay.guestName || "Hold"}
                  {stay.guestEmail ? ` · ${stay.guestEmail}` : ""}
                </p>
              </div>
              <form action={deleteReservation.bind(null, propertyId, stay.id)}>
                <button type="submit" className="text-destructive underline underline-offset-2">
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
