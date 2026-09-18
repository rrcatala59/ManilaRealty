import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseProjectUrl } from "@/src/lib/supabase/env";

export { isSupabaseConfigured, supabaseAnonKey, supabaseProjectUrl };

/** Server-side data client (no browser session). Listings, inquiries, bookings. */
export function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  return createClient(supabaseProjectUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

let serverClient: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (serverClient !== undefined) return serverClient;
  serverClient = createSupabaseClient();
  return serverClient;
}

export function getServiceSupabase(): SupabaseClient | null {
  const url = supabaseProjectUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
