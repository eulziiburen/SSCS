// Social media links in the footer, editable in admin → Нүүр. Empty links are hidden.

export const SOCIAL_KEYS = ["facebook", "x", "youtube", "instagram"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type Social = Record<SocialKey, string>;

export const SOCIAL_LABEL: Record<SocialKey, string> = { facebook: "Facebook", x: "X", youtube: "YouTube", instagram: "Instagram" };

// Only http(s) links, so a stored value can never become a javascript: URL
export function cleanUrl(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export function mergeSocial(stored: unknown): Social {
  const v = (stored && typeof stored === "object" ? stored : {}) as Partial<Record<SocialKey, unknown>>;
  return Object.fromEntries(SOCIAL_KEYS.map((k) => [k, cleanUrl(v[k])])) as Social;
}
