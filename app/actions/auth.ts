"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { safeAdminPath } from "@/src/lib/supabase/auth-config";
import { createServerSupabase } from "@/src/lib/supabase/server";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const afterLogin = safeAdminPath(String(formData.get("next") ?? ""));

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) redirect(afterLogin);
    }
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
