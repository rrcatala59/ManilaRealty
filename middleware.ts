import { NextRequest } from "next/server";
import { protectAdminRoute } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return protectAdminRoute(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
