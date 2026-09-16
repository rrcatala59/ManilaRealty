import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export type InquiryNotificationPayload = {
  inquiryId: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  adminEmails?: string[];
};

export type RenderedInquiryEmail = {
  subject: string;
  text: string;
  html: string;
};

const DEFAULT_FROM = "Brisa Realty <notifications@brisarealty.ph>";

export function parseInquiryNotificationPayload(raw: unknown): InquiryNotificationPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const inquiryId = asString(row.inquiryId ?? row.inquiry_id);
  const propertyId = asString(row.propertyId ?? row.property_id);
  const name = asString(row.name);
  const email = asString(row.email);
  const phone = asString(row.phone);
  const message = asString(row.message);
  if (!inquiryId || !propertyId || !name || !email || !phone || !message) return null;
  const adminEmails = Array.isArray(row.adminEmails)
    ? row.adminEmails.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
    : undefined;
  return {
    inquiryId,
    propertyId,
    propertyTitle: asString(row.propertyTitle ?? row.property_title) || "Listing",
    name,
    email,
    phone,
    message,
    createdAt: asString(row.createdAt ?? row.created_at) || new Date().toISOString(),
    adminEmails,
  };
}

/** Auto-generated admin alert for a new listing inquiry. */
export function renderInquiryAdminEmail(payload: InquiryNotificationPayload): RenderedInquiryEmail {
  const when = formatManila(payload.createdAt);
  const subject = `New inquiry · ${payload.propertyTitle} · ${payload.name}`;
  const text = [
    "A guest submitted a viewing inquiry on Brisa Realty.",
    "",
    `Home: ${payload.propertyTitle}`,
    `Listing ID: ${payload.propertyId}`,
    `Received: ${when}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    "",
    "Message:",
    payload.message,
    "",
    `Inbox: ${studioInboxUrl()}`,
    `Inquiry ID: ${payload.inquiryId}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4efe6;color:#3a342c;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f2;border:1px solid #e4d9c8;">
            <tr>
              <td style="padding:28px 32px 12px;letter-spacing:0.28em;font-size:11px;text-transform:uppercase;color:#7a7166;font-family:ui-sans-serif,system-ui,sans-serif;">
                Brisa Realty · New inquiry
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;font-size:28px;line-height:1.2;">
                ${escapeHtml(payload.propertyTitle)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;font-size:14px;line-height:1.6;color:#7a7166;font-family:ui-sans-serif,system-ui,sans-serif;">
                ${escapeHtml(payload.name)} asked to view this home on ${escapeHtml(when)}.
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4d9c8;border-bottom:1px solid #e4d9c8;">
                  ${rowHtml("Name", payload.name)}
                  ${rowHtml("Email", payload.email)}
                  ${rowHtml("Phone", payload.phone)}
                  ${rowHtml("Listing ID", payload.propertyId)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7a7166;font-family:ui-sans-serif,system-ui,sans-serif;">
                Message
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;font-size:15px;line-height:1.7;">${escapeHtml(payload.message).replaceAll("\n", "<br />")}</td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;font-family:ui-sans-serif,system-ui,sans-serif;">
                <a href="${escapeHtml(studioInboxUrl())}" style="display:inline-block;background:#3a342c;color:#fbf8f2;text-decoration:none;letter-spacing:0.16em;text-transform:uppercase;font-size:11px;padding:12px 18px;">
                  Open studio inbox
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

export function resolveAdminRecipients(payload: InquiryNotificationPayload): string[] {
  const fromPayload = payload.adminEmails ?? [];
  const fromEnv = (process.env.ADMIN_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...fromPayload, ...fromEnv])];
}

export function inquiryNotifySecretMatches(provided: string, expected: string) {
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function sendAdminInquiryNotification(payload: InquiryNotificationPayload) {
  const rendered = renderInquiryAdminEmail(payload);
  const to = resolveAdminRecipients(payload);
  if (to.length === 0) {
    console.warn("inquiry-notification: no admin recipients configured");
    return { ok: false as const, error: "No admin recipients configured." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("inquiry-notification[mock]", {
      to,
      subject: rendered.subject,
      text: rendered.text,
    });
    return { ok: true as const, mocked: true as const, to, subject: rendered.subject };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM?.trim() || DEFAULT_FROM,
      to,
      reply_to: payload.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("inquiry-notification: Resend rejected the message", response.status, detail);
    return { ok: false as const, error: "The mail provider rejected the notice." };
  }

  return { ok: true as const, mocked: false as const, to, subject: rendered.subject };
}

export async function enqueueLocalInquiryNotification(payload: InquiryNotificationPayload) {
  await prisma.inquiryNotificationOutbox.create({
    data: {
      inquiryId: payload.inquiryId,
      payload: JSON.stringify(payload),
      status: "pending",
    },
  });
}

export async function flushInquiryNotificationOutbox() {
  const rows = await prisma.inquiryNotificationOutbox.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  let sent = 0;
  for (const row of rows) {
    let parsed: unknown = row.payload;
    try {
      parsed = JSON.parse(row.payload);
    } catch {
      parsed = row.payload;
    }
    const payload = parseInquiryNotificationPayload(parsed);
    if (!payload) {
      await prisma.inquiryNotificationOutbox.update({
        where: { id: row.id },
        data: { status: "failed", error: "Payload could not be parsed." },
      });
      continue;
    }
    if (payload.propertyTitle === "Listing") {
      const listing = await prisma.property.findUnique({
        where: { id: payload.propertyId },
        select: { title: true },
      });
      if (listing?.title) payload.propertyTitle = listing.title;
    }

    const result = await sendAdminInquiryNotification(payload);
    await prisma.inquiryNotificationOutbox.update({
      where: { id: row.id },
      data: result.ok
        ? { status: "sent", sentAt: new Date(), error: null }
        : { status: "failed", error: result.error ?? "Send failed." },
    });
    if (result.ok) sent += 1;
  }

  return sent;
}

function studioInboxUrl() {
  const base = (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:43123").replace(
    /\/$/,
    ""
  );
  return `${base}/admin/inquiries`;
}

function formatManila(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rowHtml(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7166;width:120px;font-family:ui-sans-serif,system-ui,sans-serif;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;font-size:14px;">${escapeHtml(value)}</td>
  </tr>`;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
