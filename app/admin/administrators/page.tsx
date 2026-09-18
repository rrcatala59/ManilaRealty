import { requireAdmin } from "@/src/lib/auth-guard";
import { listStudioAdmins } from "@/src/lib/studio-admins";
import { AddAdministratorForm } from "@/src/components/AddAdministratorForm";
import { removeAdministratorAction } from "@/app/actions/admins";

export const metadata = {
  title: "Administrators",
};

export default async function AdministratorsPage() {
  const actor = await requireAdmin();
  let admins: Awaited<ReturnType<typeof listStudioAdmins>> = [];
  let loadError = "";
  try {
    admins = await listStudioAdmins(actor.id);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load administrators.";
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Studio access</p>
      <h1 className="font-heading mt-1 text-4xl">Administrators</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Any administrator can add others. The master administrator cannot be removed.
      </p>

      {loadError ? (
        <p className="mt-8 text-sm text-destructive">{loadError}</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border border-border bg-card">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium">{admin.email}</p>
                <p className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                  {admin.isMaster ? "Master administrator" : "Administrator"}
                </p>
              </div>
              {admin.isMaster ? (
                <span className="text-xs text-muted-foreground">Protected</span>
              ) : (
                <form action={removeAdministratorAction}>
                  <input type="hidden" name="id" value={admin.id} />
                  <button type="submit" className="text-sm text-destructive underline underline-offset-4">
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      <AddAdministratorForm />
    </div>
  );
}
