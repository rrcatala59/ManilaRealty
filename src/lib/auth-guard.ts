import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { hasAdminFlag, hasMasterFlag, supabaseAuthConfig } from "@/src/lib/supabase/auth-config";
import { createServerSupabase } from "@/src/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email?: string | null;
  isAdmin: true;
  isMaster: boolean;
};

async function readAdminProfile(userId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const full = await supabase
    .from(supabaseAuthConfig.profileTable)
    .select("is_admin, is_master")
    .eq("id", userId)
    .maybeSingle();
  if (!full.error) return full.data;
  const basic = await supabase
    .from(supabaseAuthConfig.profileTable)
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return basic.data;
}

export async function getAdminOrNull(): Promise<AdminIdentity | null> {
  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const profile = await readAdminProfile(user.id);
      if (hasAdminFlag(profile)) {
        return { id: user.id, email: user.email, isAdmin: true, isMaster: hasMasterFlag(profile) };
      }
      return null;
    }
  }

  if (!process.env.AUTH_SECRET) {
    return null;
  }

  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return { id: session.user.id, email: session.user.email, isAdmin: true, isMaster: true };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdminOrNull();
  if (admin) return admin;

  if (isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const hasSupabaseUser = cookieStore.getAll().some((cookie) => cookie.name.includes("sb-"));
    if (hasSupabaseUser) {
      redirect(supabaseAuthConfig.forbiddenPath);
    }
  }

  redirect("/login");
}
