"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: InquiryState = { ok: false };

export function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div className="border border-border bg-card/80 p-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Inquiry sent</p>
        <h3 className="font-heading mt-2 text-2xl">We have your note.</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A Brisa advisor will reply within one business day about {propertyTitle}.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" className="h-11 rounded-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-11 rounded-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" required autoComplete="tel" className="h-11 rounded-sm" placeholder="+63" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          className="rounded-sm"
          placeholder={`I would like to view ${propertyTitle}.`}
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-sm tracking-[0.16em] uppercase">
        {pending ? "Sending…" : "Request a viewing"}
      </Button>
    </form>
  );
}
