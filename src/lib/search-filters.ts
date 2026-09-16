import type { PropertyRecord } from "@/src/types";

export type SearchFilterColumn = "city" | "type" | "sqm";
export type SearchFilterOp = "eq" | "gte";

/** Reactive clause list consumed by the Supabase/Prisma filter chain. */
export type SearchFilterClause = {
  column: SearchFilterColumn;
  op: SearchFilterOp;
  value: string | number;
};

export const SEARCH_AREAS = ["Makati", "BGC", "New Manila"] as const;
export const SEARCH_CATEGORIES = [
  { value: "CONDO", label: "Condo" },
  { value: "HOUSE", label: "House & Lot" },
  { value: "COMMERCIAL", label: "Commercial" },
] as const;
export const SEARCH_MIN_SIZES = [
  { value: "", label: "Any size" },
  { value: "50", label: "50 sqm+" },
  { value: "80", label: "80 sqm+" },
  { value: "120", label: "120 sqm+" },
  { value: "200", label: "200 sqm+" },
] as const;

export const STRUCTURAL_PROPERTY_ID = "00000000-0000-0000-0000-000000000001";

export function buildSearchClauses(state: {
  area: string;
  category: string;
  minSqm: string;
}): SearchFilterClause[] {
  const clauses: SearchFilterClause[] = [];
  if (state.area) clauses.push({ column: "city", op: "eq", value: state.area });
  if (state.category) clauses.push({ column: "type", op: "eq", value: state.category });
  if (state.minSqm) clauses.push({ column: "sqm", op: "gte", value: Number(state.minSqm) });
  return clauses;
}

export function applyClausesLocal(properties: PropertyRecord[], clauses: SearchFilterClause[]) {
  return properties.filter((property) =>
    clauses.every((clause) => {
      if (clause.column === "city" && clause.op === "eq") return property.city === clause.value;
      if (clause.column === "type" && clause.op === "eq") return property.type === clause.value;
      if (clause.column === "sqm" && clause.op === "gte") return property.sqm >= Number(clause.value);
      return true;
    })
  );
}

export function sanitizeSearchClauses(input: unknown): SearchFilterClause[] {
  if (!Array.isArray(input)) return [];
  const allowedColumns: SearchFilterColumn[] = ["city", "type", "sqm"];
  const allowedOps: SearchFilterOp[] = ["eq", "gte"];
  const allowedTypes = new Set(["CONDO", "HOUSE", "COMMERCIAL"]);

  return input
    .map((item) => item as Partial<SearchFilterClause>)
    .filter((item): item is SearchFilterClause => {
      if (!item || !allowedColumns.includes(item.column as SearchFilterColumn)) return false;
      if (!allowedOps.includes(item.op as SearchFilterOp)) return false;
      if (item.column === "type" && !allowedTypes.has(String(item.value))) return false;
      if (item.column === "sqm") {
        const size = Number(item.value);
        return Number.isFinite(size) && size >= 1 && size <= 20000;
      }
      if (item.column === "city") {
        const city = String(item.value);
        return city.length >= 2 && city.length <= 80;
      }
      return item.value != null && String(item.value).length > 0;
    })
    .slice(0, 8)
    .map((item) =>
      item.column === "sqm"
        ? { ...item, value: Number(item.value) }
        : { ...item, value: String(item.value) }
    );
}
