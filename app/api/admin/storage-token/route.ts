import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/src/lib/auth-guard";
import { createServerSupabase } from "@/src/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await getAdminOrNull();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", token: "" }, { status: 401 });
    }
    const supabase = await createServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "No Supabase session client", token: "" }, { status: 500 });
    }
    const { data } = await supabase.auth.getSession();
    return NextResponse.json({ token: data.session?.access_token ?? "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token lookup failed";
    return NextResponse.json({ error: message, token: "" }, { status: 500 });
  }
}
