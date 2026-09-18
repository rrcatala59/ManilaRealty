import { type NextRequest, NextResponse } from "next/server";
import { protectAdminRoute } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  return protectAdminRoute(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
