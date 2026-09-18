"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseProjectUrl } from "@/src/lib/supabase/env";

/** Browser client for Client Components. Uses the anon key from env. */
export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(supabaseProjectUrl(), supabaseAnonKey());
}
