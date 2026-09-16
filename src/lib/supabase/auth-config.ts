/**
 * Supabase Auth middleware configuration for Brisa Realty.
 * Protects the /admin subtree: guests go to /login; signed-in users without
 * profiles.is_admin are sent home. Cookie refresh uses @supabase/ssr.
 */
export const supabaseAuthConfig = {
  loginPath: "/login",
  forbiddenPath: "/",
  adminMatcher: ["/admin", "/admin/:path*"] as const,
  adminFlagColumn: "is_admin" as const,
  profileTable: "profiles" as const,
};

export const ADMIN_SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

export function hasAdminFlag(profile: unknown): boolean {
  if (!profile || typeof profile !== "object") return false;
  return Boolean((profile as Record<string, unknown>)[supabaseAuthConfig.adminFlagColumn]);
}

/** Only same-origin /admin paths are accepted as post-login redirects. */
export function safeAdminPath(value: string | null | undefined) {
  if (!value) return "/admin/dashboard";
  if (!value.startsWith("/admin")) return "/admin/dashboard";
  if (value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return "/admin/dashboard";
  }
  return value;
}
