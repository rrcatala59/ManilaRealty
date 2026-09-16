"use client";

import { useMemo, useState, useActionState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestStay, type BookingState } from "@/app/actions/bookings";
import { datesOverlap, type ReservationWindow } from "@/src/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function keyFromParts(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function addMonths(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function nightsBetween(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const initial: BookingState = { ok: false };

export function BookingCalendar({
  propertyId,
  propertyTitle,
  isOpen,
  windows,
}: {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  windows: ReservationWindow[];
}) {
  const today = toLocalToday();
  const now = new Date();
  const [{ year, month }, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [state, action, pending] = useActionState(requestStay, initial);

  const blocked = useMemo(() => {
    const set = new Set<string>();
    const days = daysInMonth(year, month);
    for (let day = 1; day <= days; day += 1) {
      const key = keyFromParts(year, month, day);
      const occupied = windows.some((window) => key >= window.startDate && key < window.endDate);
      if (occupied) set.add(key);
    }
    return set;
  }, [windows, year, month]);

  function selectDay(key: string) {
    if (!isOpen || key < today) return;
    const pickingCheckout = Boolean(startDate && !endDate && key > startDate);
    if (pickingCheckout && isRangeClear(startDate!, key, windows)) {
      setEndDate(key);
      return;
    }
    if (blocked.has(key)) return;
    setStartDate(key);
    setEndDate(null);
  }

  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : 0;
  const available = Boolean(startDate && endDate && isOpen && isRangeClear(startDate, endDate, windows));

  if (!isOpen) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Stay calendar</p>
        <h3 className="font-heading mt-2 text-2xl">Not open for dates</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          This listing is sold, rented, or marked unavailable. Inquire below if you would like to be notified.
        </p>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Hold placed</p>
        <h3 className="font-heading mt-2 text-2xl">Those nights are requested.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          A Brisa advisor will confirm {propertyTitle} for your selected stay.
        </p>
      </div>
    );
  }

  const firstWeekday = new Date(year, month, 1).getDay();
  const days = daysInMonth(year, month);
  const cells: Array<string | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, index) => keyFromParts(year, month, index + 1)),
  ];

  return (
    <div className="border border-border bg-card p-6">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Stay calendar</p>
      <h3 className="font-heading mt-1 text-2xl">Check dates</h3>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        Select check-in, then check-out. Blocked nights are already held.
      </p>

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="flex size-8 items-center justify-center border border-border"
          onClick={() => setCursor(addMonths(year, month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-heading text-xl">
          {new Date(year, month, 1).toLocaleString("en-PH", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          className="flex size-8 items-center justify-center border border-border"
          onClick={() => setCursor(addMonths(year, month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((key, index) => {
          if (!key) return <div key={`e-${index}`} />;
          const isPast = key < today;
          const isBlocked = blocked.has(key);
          const inRange = Boolean(startDate && endDate && key >= startDate && key < endDate);
          const isStart = key === startDate;
          const isEnd = key === endDate;
          const checkoutCandidate =
            Boolean(startDate && !endDate && key > startDate && isRangeClear(startDate, key, windows));
          const disabled = isPast || (isBlocked && !checkoutCandidate);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              data-date={key}
              data-held={isBlocked ? "true" : "false"}
              aria-disabled={disabled}
              onClick={() => selectDay(key)}
              className={cn(
                "aspect-square text-sm transition-colors",
                disabled && "text-muted-foreground/40 line-through",
                isBlocked && !isPast && "bg-stone-warm/20 text-muted-foreground",
                inRange && "bg-primary/10",
                (isStart || isEnd) && "bg-primary text-primary-foreground",
                !disabled && !isStart && !isEnd && "hover:bg-muted"
              )}
            >
              {Number(key.slice(-2))}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 bg-primary" /> Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 bg-stone-warm/40" /> Held
        </span>
      </div>

      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="startDate" value={startDate ?? ""} />
        <input type="hidden" name="endDate" value={endDate ?? ""} />
        <p className="text-sm">
          {startDate && endDate ? (
            <>
              {startDate} → {endDate} · {nights} {nights === 1 ? "night" : "nights"}
              {available ? " · open" : " · overlap"}
            </>
          ) : (
            "Choose a start and end date."
          )}
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="guestName">Name</Label>
          <Input id="guestName" name="guestName" required className="h-11 rounded-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="guestEmail">Email</Label>
          <Input id="guestEmail" name="guestEmail" type="email" required className="h-11 rounded-sm" />
        </div>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Button
          type="submit"
          disabled={!available || pending}
          className="h-11 w-full rounded-sm tracking-[0.16em] uppercase"
        >
          {pending ? "Holding…" : "Request these dates"}
        </Button>
      </form>
    </div>
  );
}

function toLocalToday() {
  const now = new Date();
  return keyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isRangeClear(start: string, end: string, windows: ReservationWindow[]) {
  return !windows.some((window) => datesOverlap(start, end, window.startDate, window.endDate));
}
