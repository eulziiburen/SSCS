import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  buildSessionToken,
  timingSafeStringEqual,
  verifySessionToken,
} from "./session-token";

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;
  return (
    timingSafeStringEqual(username, expectedUser) && timingSafeStringEqual(password, expectedPass)
  );
}

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, await buildSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}
