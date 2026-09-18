/**
 * Public Supabase project URL + anon key.
 * The dashboard sometimes copies a REST path (`.../rest/v1/`); the JS client
 * needs the project origin only (`https://<ref>.supabase.co`).
 */
export function supabaseProjectUrl(raw = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!raw) return "";
  try {
    const parsed = new URL(raw.trim());
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

export function supabaseAnonKey(raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  return raw?.trim() ?? "";
}

export function isSupabaseConfigured() {
  return Boolean(supabaseProjectUrl() && supabaseAnonKey());
}
