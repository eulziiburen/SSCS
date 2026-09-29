"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, ensureDb } from "@/db/client";
import { users } from "@/db/schema";
import { isEmail } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { sendMail } from "@/lib/mailer";
import { dialByIso, DEFAULT_DIAL, formatPhone, isValidPhone } from "@/lib/phone";
import {
  consumeOtp,
  findUserByLogin,
  hashPassword,
  issueOtp,
  LOCK_MINUTES,
  MAX_FAILED_LOGINS,
  MIN_PASSWORD,
  normEmail,
  signIn,
  signOut,
  verifyPassword,
  type OtpPurpose,
} from "@/lib/user-auth";

// step "code": the code form is showing for `login`
export type AuthState = { error?: string; info?: string; step?: "code"; values?: Record<string, string> } | null;

const get = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const dict = (fd: FormData) => {
  const l = fd.get("locale");
  return getDictionary(isLocale(l) ? l : "mn");
};

// Only same-site paths, so the sign-in page can't be used to bounce people elsewhere
function nextPath(fd: FormData) {
  const n = get(fd, "next");
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/account";
}

/* ---------- password sign-in ---------- */

export async function loginWithPassword(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const t = dict(fd).auth;
  const login = get(fd, "login");
  const values = { login };
  if (!login) return { error: t.errLoginField, values };
  const user = await findUserByLogin(login);
  if (user?.lockedUntil && Date.parse(user.lockedUntil) > Date.now()) {
    return { error: t.errLocked(Math.ceil((Date.parse(user.lockedUntil) - Date.now()) / 60000)), values };
  }
  // Hash even when there's no such user so response time doesn't reveal which accounts exist
  const ok = await verifyPassword(String(fd.get("password") ?? ""), user?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86));
  if (!user || !ok) {
    if (user) {
      const failed = user.failedLogins + 1;
      await db
        .update(users)
        .set(failed >= MAX_FAILED_LOGINS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() } : { failedLogins: failed })
        .where(eq(users.id, user.id));
    }
    return { error: t.errLogin, values };
  }
  await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, user.id));
  await signIn(user, fd.get("remember") === "on");
  redirect(nextPath(fd));
}

/* ---------- one-time codes ---------- */

async function sendCode(fd: FormData, purpose: OtpPurpose): Promise<AuthState> {
  const t = dict(fd).auth;
  const login = get(fd, "login");
  const values = { login };
  if (!login) return { error: t.errLoginField, values };
  const user = await findUserByLogin(login);
  // Same answer whether or not the account exists
  if (!user) return { step: "code", info: t.codeSent, values };
  const issued = await issueOtp(user.email, purpose);
  if ("wait" in issued) return { error: t.errWait, step: "code", values };
  const sent = await sendMail({ to: user.email, subject: purpose === "login" ? t.mailLoginSubject : t.mailResetSubject, text: t.mailBody(issued.code) });
  if (!sent) return { error: t.errMail, values };
  return { step: "code", info: t.codeSent, values };
}

export async function requestLoginCode(_prev: AuthState, fd: FormData) {
  return sendCode(fd, "login");
}

export async function requestResetCode(_prev: AuthState, fd: FormData) {
  return sendCode(fd, "reset");
}

export async function loginWithCode(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const t = dict(fd).auth;
  const login = get(fd, "login");
  const user = await findUserByLogin(login);
  if (!user || !(await consumeOtp(user.email, "login", get(fd, "code")))) return { error: t.errCode, step: "code", values: { login } };
  await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, user.id));
  await signIn(user, fd.get("remember") === "on");
  redirect(nextPath(fd));
}

export async function resetPassword(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const t = dict(fd).auth;
  const login = get(fd, "login");
  const values = { login };
  const password = String(fd.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: t.errPassword, step: "code", values };
  if (password !== String(fd.get("confirm") ?? "")) return { error: t.errMismatch, step: "code", values };
  const user = await findUserByLogin(login);
  if (!user || !(await consumeOtp(user.email, "reset", get(fd, "code")))) return { error: t.errCode, step: "code", values };
  // A new session version signs out every other device
  const sessionVersion = user.sessionVersion + 1;
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), sessionVersion, failedLogins: 0, lockedUntil: null })
    .where(eq(users.id, user.id));
  await signIn({ id: user.id, sessionVersion }, false);
  redirect("/account");
}

/* ---------- registration ---------- */

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const d = dict(fd);
  const t = d.auth;
  const values = { lastName: get(fd, "lastName"), firstName: get(fd, "firstName"), email: normEmail(get(fd, "email")), phone: get(fd, "phone"), dial: get(fd, "dial") };
  const dial = dialByIso(values.dial) ?? DEFAULT_DIAL;
  const password = String(fd.get("password") ?? "");

  if (!values.lastName || !values.firstName || values.lastName.length > 60 || values.firstName.length > 60) return { error: d.errors.input, values };
  if (!isEmail(values.email)) return { error: d.errors.email, values };
  if (!isValidPhone(dial.iso, values.phone)) return { error: d.booking.phoneError(dial.iso === "MN"), values };
  if (password.length < MIN_PASSWORD) return { error: t.errPassword, values };
  if (password !== String(fd.get("confirm") ?? "")) return { error: t.errMismatch, values };

  await ensureDb();
  const phoneNorm = dial.code.replace(/\D/g, "") + values.phone.replace(/\D/g, "");
  if ((await db.select({ id: users.id }).from(users).where(eq(users.email, values.email))).length) return { error: t.errEmailTaken, values };
  if ((await db.select({ id: users.id }).from(users).where(eq(users.phoneNorm, phoneNorm))).length) return { error: t.errPhoneTaken, values };

  let created;
  try {
    [created] = await db
      .insert(users)
      .values({
        lastName: values.lastName,
        firstName: values.firstName,
        email: values.email,
        phone: formatPhone(dial.iso, values.phone),
        phoneIso: dial.iso,
        phoneNorm,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
      })
      .returning();
  } catch (e) {
    // Two sign-ups racing for the same email or phone
    if (String(e).includes("UNIQUE")) return { error: t.errEmailTaken, values };
    throw e;
  }
  await signIn(created, true);
  redirect(nextPath(fd));
}

export async function logoutUser() {
  await signOut();
  redirect("/");
}
