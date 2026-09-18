import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseProjectUrl } from "@/src/lib/supabase/env";
import { ADMIN_SESSION_COOKIES, hasAdminFlag, supabaseAuthConfig } from "@/src/lib/supabase/auth-config";

function hasLocalAdminCookie(request: NextRequest) {
  return ADMIN_SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function protectAdminRoute(request: NextRequest) {
  if (!isAdminPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const login = new URL(supabaseAuthConfig.loginPath, request.url);
  login.searchParams.set("next", request.nextUrl.pathname);

  if (!isSupabaseConfigured()) {
    if (!hasLocalAdminCookie(request)) {
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next();
  const supabase = createServerClient(
    supabaseProjectUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from(supabaseAuthConfig.profileTable)
      .select(supabaseAuthConfig.adminFlagColumn)
      .eq("id", user.id)
      .maybeSingle();

    if (hasAdminFlag(profile)) {
      return response;
    }
    return NextResponse.redirect(new URL(supabaseAuthConfig.forbiddenPath, request.url));
  }

  if (hasLocalAdminCookie(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(login);
}
