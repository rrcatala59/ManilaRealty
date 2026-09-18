"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { hasAdminFlag, safeAdminPath, supabaseAuthConfig } from "@/src/lib/supabase/auth-config";
import { createServerSupabase } from "@/src/lib/supabase/server";

export type LoginState = { error?: string };

function supabaseLoginError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Confirm this email in Supabase (Authentication → Users) before signing in.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Those credentials were not recognised. This site uses Supabase Auth, not the README demo login (admin@brisarealty.ph). Use the email and password from Authentication → Users.";
  }
  return message || "Those credentials were not recognised.";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const afterLogin = safeAdminPath(String(formData.get("next") ?? ""));

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) {
      return { error: "Supabase is configured, but the auth client could not start." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: supabaseLoginError(error.message) };
    }

    const userId = data.user?.id;
    if (!userId) {
      return { error: "Sign-in did not return a user." };
    }

    const { data: profile } = await supabase
      .from(supabaseAuthConfig.profileTable)
      .select(supabaseAuthConfig.adminFlagColumn)
      .eq("id", userId)
      .maybeSingle();

    if (!hasAdminFlag(profile)) {
      await supabase.auth.signOut();
      return {
        error:
          "This account can sign in, but public.profiles.is_admin is not true. In the SQL Editor run: update public.profiles set is_admin = true where id = '<your user uid>';",
      };
    }

    redirect(afterLogin);
  }

  if (!process.env.AUTH_SECRET) {
    return { error: "Those credentials were not recognised." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: afterLogin,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Those credentials were not recognised." };
    }
    throw error;
  }
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  if (process.env.AUTH_SECRET) {
    await signOut({ redirectTo: "/" });
  }
  redirect("/");
}
