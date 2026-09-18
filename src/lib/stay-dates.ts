export function padDay(value: number) {
  return String(value).padStart(2, "0");
}

export function dateKey(year: number, month: number, day: number) {
  return `${year}-${padDay(month + 1)}-${padDay(day)}`;
}

export function addMonths(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function localTodayKey() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function nightsBetween(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatStayDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-PH", { month: "long", year: "numeric" });
}
