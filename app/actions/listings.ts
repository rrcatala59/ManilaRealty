"use server";

import { listPropertiesByClauses } from "@/src/lib/listings";
import { sanitizeSearchClauses, type SearchFilterClause } from "@/src/lib/search-filters";

export async function filterListings(clauses: SearchFilterClause[]) {
  return listPropertiesByClauses(sanitizeSearchClauses(clauses));
}
