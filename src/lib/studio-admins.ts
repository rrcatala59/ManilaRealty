import { getServiceSupabase } from "@/src/lib/supabase";

export type StudioAdmin = {
  id: string;
  email: string;
  isMaster: boolean;
  createdAt: string | null;
};

function serviceOrThrow() {
  const service = getServiceSupabase();
  if (!service) {
    throw new Error(
      "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and to AWS Amplify environment variables so the studio can create and list administrators."
    );
  }
  return service;
}

function missingMasterColumn(message: string) {
  return /is_master|schema cache/i.test(message);
}

export async function ensureMasterAdministrator(actorId: string) {
  const service = serviceOrThrow();
  const existing = await service.from("profiles").select("id").eq("is_master", true).maybeSingle();
  if (existing.error) {
    if (missingMasterColumn(existing.error.message)) {
      throw new Error("Run supabase/admin-master.sql in the Supabase SQL Editor, then refresh this page.");
    }
    throw new Error(existing.error.message);
  }
  if (existing.data) return;
  const { error } = await service.from("profiles").update({ is_master: true, is_admin: true }).eq("id", actorId);
  if (error) throw new Error(error.message);
}

export async function listStudioAdmins(actorId: string): Promise<StudioAdmin[]> {
  const service = serviceOrThrow();
  await ensureMasterAdministrator(actorId);

  const { data: profiles, error } = await service
    .from("profiles")
    .select("id, is_admin, is_master, created_at")
    .eq("is_admin", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const { data, error: usersError } = await service.auth.admin.listUsers({ perPage: 200 });
  if (usersError) throw new Error(usersError.message);
  const emailById = new Map((data.users ?? []).map((user) => [user.id, user.email ?? ""]));

  return (profiles ?? []).map((row) => ({
    id: row.id as string,
    email: emailById.get(row.id as string) || "Unknown email",
    isMaster: Boolean(row.is_master),
    createdAt: (row.created_at as string | null) ?? null,
  }));
}

export async function addStudioAdmin(email: string, password: string) {
  const service = serviceOrThrow();
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const { data, error } = await service.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
  });

  let userId = data.user?.id;
  if (error) {
    const { data: listed } = await service.auth.admin.listUsers({ perPage: 200 });
    const found = (listed.users ?? []).find((user) => user.email?.toLowerCase() === normalized);
    if (!found) throw new Error(error.message);
    userId = found.id;
  }
  if (!userId) throw new Error("Could not create that administrator.");

  const { error: profileError } = await service.from("profiles").upsert({
    id: userId,
    is_admin: true,
    is_master: false,
  });
  if (profileError) throw new Error(profileError.message);
}

export async function removeStudioAdmin(targetId: string, actorId: string) {
  const service = serviceOrThrow();
  if (targetId === actorId) {
    throw new Error("You cannot remove your own administrator access.");
  }
  const { data: target, error } = await service
    .from("profiles")
    .select("id, is_master")
    .eq("id", targetId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!target) throw new Error("That administrator was not found.");
  if (target.is_master) {
    throw new Error("The master administrator cannot be removed.");
  }
  const { error: updateError } = await service.from("profiles").update({ is_admin: false }).eq("id", targetId);
  if (updateError) throw new Error(updateError.message);
}
