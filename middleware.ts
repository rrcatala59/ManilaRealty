import { type NextRequest } from "next/server";
import { protectAdminRoute } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return protectAdminRoute(request);
}

// Matcher must be a compile-time literal (Next cannot parse spreads from auth-config).
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
