"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { safeAdminPath } from "@/src/lib/supabase/auth-config";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeAdminPath(String(formData.get("next") ?? "")),
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
  await signOut({ redirectTo: "/" });
}
