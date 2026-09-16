import { NextResponse } from "next/server";
import {
  inquiryNotifySecretMatches,
  parseInquiryNotificationPayload,
  sendAdminInquiryNotification,
} from "@/src/utils/inquiry-notification";

export async function POST(request: Request) {
  const expected = process.env.INQUIRY_NOTIFY_SECRET?.trim() ?? "";
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const provided = bearer || request.headers.get("x-brisa-notify-secret") || "";

  if (!inquiryNotifySecretMatches(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const payload = parseInquiryNotificationPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Inquiry payload is incomplete." }, { status: 400 });
  }

  const result = await sendAdminInquiryNotification(payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    mocked: "mocked" in result ? result.mocked : false,
    subject: result.subject,
  });
}
