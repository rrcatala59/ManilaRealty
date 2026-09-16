"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: LoginState = {};

export function LoginForm({ next = "/admin/dashboard" }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="admin@brisarealty.ph"
          className="h-11 rounded-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required className="h-11 rounded-sm" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-sm tracking-[0.16em] uppercase">
        {pending ? "Signing in…" : "Enter the studio"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Demo access is listed in the README.{" "}
        <Link href="/" className="underline underline-offset-2">
          Back to the site
        </Link>
      </p>
    </form>
  );
}
