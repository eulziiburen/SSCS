// Client-safe types and helpers. Database access lives in lib/queries.ts.

export type Kind = "abroad" | "local" | "day";

export const SCENE_KEYS = ["baikal", "hainan", "shanghai", "canton", "manzhouli", "zhangjiajie", "khuvsgul", "gobi", "terelj", "altai", "khustai", "seoul"] as const;
export type SceneKey = (typeof SCENE_KEYS)[number];

export const SCENE_LABEL: Record<SceneKey, string> = {
  baikal: "Нуур, уул",
  hainan: "Далайн эрэг, далдуу мод",
  shanghai: "Хот (улбар шар)",
  canton: "Хот (цэнхэр)",
  manzhouli: "Хот (тал)",
  zhangjiajie: "Хадан багана",
  khuvsgul: "Нуур, шинэс",
  gobi: "Элсэн манхан",
  terelj: "Тал, гэр",
  altai: "Цаст уул",
  khustai: "Шар тал, гэр",
  seoul: "Хот (ягаан)",
};

export type Tour = {
  id: number;
  kind: Kind;
  scene: SceneKey;
  country: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  seats: number;
  price: number;
  route: string[];
  badge: string | null;
  hot: boolean;
  featured: boolean;
  heroEyebrow: string | null;
  upcoming: boolean;
  published: boolean;
  titleEn: string | null;
  countryEn: string | null;
  routeEn: string[];
  heroEyebrowEn: string | null;
  imageId: number | null;
};

export type NewsItem = { id: number; date: string; title: string; text: string; titleEn: string | null; textEn: string | null; published: boolean };

// English falls back to Mongolian field by field, so a partly translated tour still renders
export function localizeTour(t: Tour, locale: "mn" | "en"): Tour {
  if (locale !== "en") return t;
  return {
    ...t,
    title: t.titleEn || t.title,
    country: t.countryEn || t.country,
    route: t.routeEn.length ? t.routeEn : t.route,
    heroEyebrow: t.heroEyebrowEn || null,
  };
}

export function localizeNews(n: NewsItem, locale: "mn" | "en"): NewsItem {
  return locale === "en" ? { ...n, title: n.titleEn || n.title, text: n.textEn || n.text } : n;
}

// Mongolian labels for the admin panel; the public site uses lib/i18n.ts
export const KIND_LABEL: Record<Kind, string> = {
  abroad: "Гадаад аялал",
  local: "Дотоод аялал",
  day: "Өдрийн аялал",
};

export const VOUCHER_PRICE = 500000;
export const VOUCHER_AMOUNTS = [200000, VOUCHER_PRICE, 1000000];

export const BOOKING_STATUS = {
  new: "Шинэ",
  contacted: "Холбогдсон",
  confirmed: "Баталгаажсан",
  cancelled: "Цуцалсан",
} as const;
export type BookingStatus = keyof typeof BOOKING_STATUS;

// Deliberately loose: one @, a dot in the domain, no spaces. The manager confirms by phone anyway.
export const isEmail = (v: string) => v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const fmt = (n: number) => n.toLocaleString("en-US") + "₮";

export const dotDate = (iso: string) => iso.replaceAll("-", ".");

export const dateRange = (t: Pick<Tour, "startDate" | "endDate">) =>
  t.startDate === t.endDate ? dotDate(t.startDate) : `${dotDate(t.startDate)} – ${dotDate(t.endDate.slice(5))}`;

export const daysBetween = (start: string, end: string) => Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;

export type Filter = { q?: string; kind?: string; month?: string; budget?: string; sort?: string };

export function filterTours(tours: Tour[], { q, kind, month, budget, sort }: Filter): Tour[] {
  const needle = q?.trim().toLowerCase();
  const list = tours.filter((t) => {
    // Search both languages so "Baikal" and "Байгал" find the same tour
    const hay = [t.title, t.country, ...t.route, t.titleEn, t.countryEn, ...t.routeEn].filter(Boolean).join(" ").toLowerCase();
    if (needle && !hay.includes(needle)) return false;
    if (kind && t.kind !== kind) return false;
    if (month && Number(t.startDate.slice(5, 7)) !== Number(month)) return false;
    if (budget && t.price > Number(budget)) return false;
    return true;
  });
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return list;
}
