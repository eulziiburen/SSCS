// Outgoing email.
// - SMTP_USER + SMTP_PASS set: sent over SMTP (Gmail by default: SMTP_USER is the Gmail address,
//   SMTP_PASS a Google "App password"; SMTP_HOST / SMTP_PORT override for other providers).
// - Otherwise RESEND_API_KEY: sent through Resend.
// - Neither, on a dev machine: appended to a temp file so the flows can be tested.

import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodemailer, { type Transporter } from "nodemailer";

export const DEV_MAIL_LOG = join(tmpdir(), "sscs-dev-mail.log");

type Mail = { to: string; subject: string; text: string };

let transport: Transporter | null = null;

function smtp() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  transport ??= nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 587 upgrades with STARTTLS instead
    // Google shows app passwords in groups of four; other providers' passwords may contain real spaces
    auth: { user: user.trim(), pass: host === "smtp.gmail.com" ? pass.replace(/\s/g, "") : pass },
  });
  return { transport, user };
}

export async function sendMail({ to, subject, text }: Mail): Promise<boolean> {
  const viaSmtp = smtp();
  if (viaSmtp) {
    try {
      // Gmail only sends as the signed-in account, so the address comes from SMTP_USER
      await viaSmtp.transport.sendMail({ from: process.env.MAIL_FROM || `Soft Travel <${viaSmtp.user}>`, to, subject, text });
      return true;
    } catch (e) {
      console.error("sendMail (smtp) failed", e);
      return false;
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM || "Soft Travel <no-reply@sscs.mn>", to: [to], subject, text }),
    });
    if (!res.ok) console.error("sendMail (resend) failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  }

  if (process.env.VERCEL) return false;
  await appendFile(DEV_MAIL_LOG, JSON.stringify({ to, subject, text, at: new Date().toISOString() }) + "\n");
  return true;
}
