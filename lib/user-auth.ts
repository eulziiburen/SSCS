// Traveler accounts: password hashing, the signed session cookie and one-time codes. Server only.

import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { cache } from "react";
import { and, desc, eq, gte } from "drizzle-orm";
import { db, ensureDb } from "@/db/client";
import { otpCodes, users, type UserRow } from "@/db/schema";
import { hmacSign, timingSafeStringEqual } from "./session-token";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const USER_COOKIE = "sscs_user";
const REMEMBER_SECONDS = 60 * 60 * 24 * 30;
const SESSION_SECONDS = 60 * 60 * 24; // without "remember me": a browser-session cookie, token valid a day at most
export const MIN_PASSWORD = 8;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

/* ---------- passwords ---------- */

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

/* ---------- session cookie ---------- */

// "u.<id>.<sessionVersion>.<expiry>.<sig>" — five parts, so it can never pass the admin check (three parts)
export async function signIn(user: Pick<UserRow, "id" | "sessionVersion">, remember: boolean) {
  const ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const payload = `u.${user.id}.${user.sessionVersion}.${Date.now() + ttl * 1000}`;
  const store = await cookies();
  store.set(USER_COOKIE, `${payload}.${await hmacSign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: ttl } : {}),
  });
}

export async function signOut() {
  (await cookies()).delete(USER_COOKIE);
}

// Once per request, however many components ask
export const getCurrentUser = cache(async (): Promise<UserRow | null> => {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "u") return null;
  const [, id, version, expiry, sig] = parts;
  if (!timingSafeStringEqual(await hmacSign(parts.slice(0, 4).join(".")), sig)) return null;
  if (Date.now() > Number(expiry)) return null;
  await ensureDb();
  const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
  return user && String(user.sessionVersion) === version ? user : null;
});

/* ---------- lookup ---------- */

export const normEmail = (v: string) => v.trim().toLowerCase();

// "+976 9911 2233", "99112233" (assumed Mongolian) or "976-9911-2233" → "97699112233"
export function normPhoneInput(v: string) {
  const digits = v.replace(/\D/g, "");
  return digits.length === 8 && !v.trim().startsWith("+") ? `976${digits}` : digits;
}

export async function findUserByLogin(login: string) {
  await ensureDb();
  const where = login.includes("@") ? eq(users.email, normEmail(login)) : eq(users.phoneNorm, normPhoneInput(login));
  const [user] = await db.select().from(users).where(where);
  return user ?? null;
}

/* ---------- one-time codes ---------- */

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;
const OTP_PER_HOUR = 5;

const hashCode = (code: string) => createHash("sha256").update(`${process.env.SESSION_SECRET}:${code}`).digest("hex");

export type OtpPurpose = "login" | "reset";

// Returns the new code, or why one can't be issued yet
export async function issueOtp(target: string, purpose: OtpPurpose): Promise<{ code: string } | { wait: true }> {
  await ensureDb();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.target, target), eq(otpCodes.purpose, purpose), gte(otpCodes.createdAt, hourAgo)))
    .orderBy(desc(otpCodes.createdAt));
  if (recent.length >= OTP_PER_HOUR) return { wait: true };
  if (recent[0] && Date.now() - Date.parse(recent[0].createdAt) < OTP_RESEND_SECONDS * 1000) return { wait: true };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  // Only the newest code for a target is valid
  await db.delete(otpCodes).where(and(eq(otpCodes.target, target), eq(otpCodes.purpose, purpose), gte(otpCodes.expiresAt, new Date().toISOString())));
  await db.insert(otpCodes).values({
    purpose,
    target,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });
  return { code };
}

export async function consumeOtp(target: string, purpose: OtpPurpose, code: string): Promise<boolean> {
  await ensureDb();
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.target, target), eq(otpCodes.purpose, purpose), gte(otpCodes.expiresAt, new Date().toISOString())))
    .orderBy(desc(otpCodes.createdAt));
  if (!row || row.attempts >= OTP_MAX_ATTEMPTS) return false;
  if (!timingSafeStringEqual(row.codeHash, hashCode(code.replace(/\D/g, "")))) {
    await db.update(otpCodes).set({ attempts: row.attempts + 1 }).where(eq(otpCodes.id, row.id));
    return false;
  }
  await db.delete(otpCodes).where(eq(otpCodes.id, row.id));
  return true;
}

export { OTP_TTL_MINUTES };
