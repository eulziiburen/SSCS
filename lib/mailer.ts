// Outgoing email. Uses Resend (https://resend.com) when RESEND_API_KEY is set.
// On a dev machine without a key, messages are appended to a temp file instead so flows can be tested.

import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const DEV_MAIL_LOG = join(tmpdir(), "sscs-dev-mail.log");

export function mailConfigured() {
  return !!process.env.RESEND_API_KEY || !process.env.VERCEL;
}

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.VERCEL) return false;
    await appendFile(DEV_MAIL_LOG, JSON.stringify({ to, subject, text, at: new Date().toISOString() }) + "\n");
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Soft Travel <no-reply@sscs.mn>", to: [to], subject, text }),
  });
  if (!res.ok) console.error("sendMail failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}
