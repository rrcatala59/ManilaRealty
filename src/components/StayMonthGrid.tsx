"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { datesOverlap, type ReservationWindow } from "@/src/types";
import {
  addMonths,
  dateKey,
  daysInMonth,
  localTodayKey,
  monthLabel,
} from "@/src/lib/stay-dates";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function isRangeClear(start: string, end: string, windows: ReservationWindow[]) {
  return !windows.some((window) => datesOverlap(start, end, window.startDate, window.endDate));
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const days = daysInMonth(year, month);
  return [
    ...Array.from({ length: firstWeekday }, () => null as string | null),
    ...Array.from({ length: days }, (_, index) => dateKey(year, month, index + 1)),
  ];
}

export function StayMonthGrid({
  year,
  month,
  windows,
  startDate,
  endDate,
  onSelect,
  allowPast = false,
}: {
  year: number;
  month: number;
  windows: ReservationWindow[];
  startDate: string | null;
  endDate: string | null;
  onSelect: (key: string) => void;
  allowPast?: boolean;
}) {
  const today = localTodayKey();
  const cells = monthCells(year, month);

  return (
    <div>
      <p className="font-heading mb-3 text-center text-xl">{monthLabel(year, month)}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((key, index) => {
          if (!key) return <div key={`e-${year}-${month}-${index}`} />;
          const isPast = !allowPast && key < today;
          const isBlocked = windows.some((window) => key >= window.startDate && key < window.endDate);
          const inRange = Boolean(startDate && endDate && key >= startDate && key < endDate);
          const isStart = key === startDate;
          const isEnd = key === endDate;
          const checkoutCandidate = Boolean(
            startDate && !endDate && key > startDate && isRangeClear(startDate, key, windows)
          );
          const disabled = isPast || (isBlocked && !checkoutCandidate);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              data-date={key}
              data-held={isBlocked ? "true" : "false"}
              aria-disabled={disabled}
              onClick={() => onSelect(key)}
              className={cn(
                "aspect-square rounded-full text-sm transition-colors",
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
    </div>
  );
}

export function MonthPager({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (next: { year: number; month: number }) => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full border border-border"
        onClick={() => onChange(addMonths(year, month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full border border-border"
        onClick={() => onChange(addMonths(year, month, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
