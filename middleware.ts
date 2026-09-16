import { type NextRequest } from "next/server";
import { protectAdminRoute } from "@/src/lib/supabase/middleware";
import { supabaseAuthConfig } from "@/src/lib/supabase/auth-config";

export async function middleware(request: NextRequest) {
  return protectAdminRoute(request);
}

export const config = {
  matcher: [...supabaseAuthConfig.adminMatcher],
};
