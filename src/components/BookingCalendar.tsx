"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestStay, type BookingState } from "@/app/actions/bookings";
import { datesOverlap, type ReservationWindow } from "@/src/types";
import { formatPHP } from "@/lib/format";
import { addMonths, formatStayDay, localTodayKey, nightsBetween } from "@/src/lib/stay-dates";
import { MonthPager, StayMonthGrid, isRangeClear } from "@/src/components/StayMonthGrid";

const initial: BookingState = { ok: false };

export function BookingCalendar({
  propertyId,
  propertyTitle,
  isOpen,
  windows,
  nightlyRate,
}: {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  windows: ReservationWindow[];
  nightlyRate?: number | null;
}) {
  const today = localTodayKey();
  const now = new Date();
  const [{ year, month }, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [state, action, pending] = useActionState(requestStay, initial);
  const next = addMonths(year, month, 1);

  function selectDay(key: string) {
    if (!isOpen || key < today) return;
    const pickingCheckout = Boolean(startDate && !endDate && key > startDate);
    if (pickingCheckout && isRangeClear(startDate!, key, windows)) {
      setEndDate(key);
      return;
    }
    const occupied = windows.some((window) => key >= window.startDate && key < window.endDate);
    if (occupied) return;
    setStartDate(key);
    setEndDate(null);
  }

  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : 0;
  const overlap = Boolean(
    startDate && endDate && windows.some((window) => datesOverlap(startDate, endDate, window.startDate, window.endDate))
  );
  const available = Boolean(startDate && endDate && isOpen && nights > 0 && !overlap);
  const stayTotal = available && nightlyRate ? nightlyRate * nights : null;

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Stay calendar</p>
        <h3 className="font-heading mt-2 text-2xl">Not open for dates</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          This listing is sold, rented, or marked unavailable for stays.
        </p>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Hold placed</p>
        <h3 className="font-heading mt-2 text-2xl">Those nights are requested.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          A Brisa advisor will confirm {propertyTitle} for your selected stay.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[0_20px_60px_-40px_rgba(28,25,23,0.45)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Reserve</p>
          <h3 className="font-heading mt-1 text-2xl">
            {nightlyRate ? (
              <>
                {formatPHP(nightlyRate)} <span className="text-base font-sans font-normal text-muted-foreground">/ night</span>
              </>
            ) : (
              "Check dates"
            )}
          </h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-border text-left">
        <div className="border-r border-border px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">Check-in</p>
          <p className="mt-0.5 text-sm">{startDate ? formatStayDay(startDate) : "Add date"}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">Check-out</p>
          <p className="mt-0.5 text-sm">{endDate ? formatStayDay(endDate) : "Add date"}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <MonthPager year={year} month={month} onChange={setCursor} />
        <div className="grid gap-8 md:grid-cols-2">
          <StayMonthGrid
            year={year}
            month={month}
            windows={windows}
            startDate={startDate}
            endDate={endDate}
            onSelect={selectDay}
          />
          <div className="hidden md:block">
            <StayMonthGrid
              year={next.year}
              month={next.month}
              windows={windows}
              startDate={startDate}
              endDate={endDate}
              onSelect={selectDay}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-primary" /> Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-stone-warm/40" /> Booked
        </span>
      </div>

      <p
        className="mt-4 text-sm"
        data-availability={startDate && endDate ? (available ? "open" : "blocked") : "pending"}
      >
        {!startDate
          ? "Select check-in, then check-out. Booked nights are already taken."
          : !endDate
            ? "Choose a check-out date."
            : available
              ? `${startDate} → ${endDate} · ${nights} ${nights === 1 ? "night" : "nights"} · available`
              : "Those dates are already booked."}
      </p>
      {stayTotal != null ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPHP(nightlyRate!)} × {nights} = {formatPHP(stayTotal)}
        </p>
      ) : null}

      <form action={action} className="mt-5 space-y-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="startDate" value={startDate ?? ""} />
        <input type="hidden" name="endDate" value={endDate ?? ""} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="guestName">Name</Label>
            <Input id="guestName" name="guestName" required className="h-11 rounded-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guestEmail">Email</Label>
            <Input id="guestEmail" name="guestEmail" type="email" required className="h-11 rounded-sm" />
          </div>
        </div>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Button
          type="submit"
          disabled={!available || pending}
          className="h-12 w-full rounded-xl tracking-[0.16em] uppercase"
        >
          {pending ? "Holding…" : "Request these dates"}
        </Button>
      </form>
    </div>
  );
}
