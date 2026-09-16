import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasAdminFlag, supabaseAuthConfig } from "@/src/lib/supabase/auth-config";

export type AdminIdentity = {
  id: string;
  email?: string | null;
  isAdmin: true;
};

export async function requireAdmin(): Promise<AdminIdentity> {
  if (isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Components cannot always persist refreshed auth cookies.
            }
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
        return { id: user.id, email: user.email, isAdmin: true };
      }
      redirect(supabaseAuthConfig.forbiddenPath);
    }
  }

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return { id: session.user.id, email: session.user.email, isAdmin: true };
}
