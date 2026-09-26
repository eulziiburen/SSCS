import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, isLocale } from "@/lib/i18n";

// "?lang=en" gives each language its own crawlable URL. It wins over the cookie
// for this request and is remembered so the visitor stays in that language.
export function proxy(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang");
  if (!isLocale(lang)) return NextResponse.next();

  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, lang);
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export const config = {
  matcher: ["/((?!_next/|brand/|admin|icon|favicon.ico|robots.txt|sitemap.xml).*)"],
};
