const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET тохируулагдаагүй байна.");
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(sig);
}

export async function buildSessionToken(): Promise<string> {
  const payload = `admin.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const sig = await hmacSign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [subject, expiry, sig] = parts;
  const payload = `${subject}.${expiry}`;
  const expected = await hmacSign(payload);
  if (!timingSafeStringEqual(expected, sig)) return false;
  if (Date.now() > Number(expiry)) return false;
  return subject === "admin";
}

export const SESSION_COOKIE_NAME = "sscs_admin_session";
export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
