"use client";

import { useActionState } from "react";
import { addAdministratorAction, type AdminManageState } from "@/app/actions/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AdminManageState = {};

export function AddAdministratorForm() {
  const [state, action, pending] = useActionState(addAdministratorAction, initial);

  return (
    <form action={action} className="mt-8 max-w-md space-y-4 border border-border bg-card p-6">
      <p className="text-sm font-medium">Add an administrator</p>
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" name="email" type="email" required autoComplete="off" className="h-11 rounded-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Temporary password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-11 rounded-sm"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-muted-foreground">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-sm tracking-[0.14em] uppercase">
        {pending ? "Adding…" : "Add administrator"}
      </Button>
    </form>
  );
}
