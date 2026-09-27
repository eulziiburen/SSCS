// Provinces (map) and hotels. Client-safe types and helpers; database access is in lib/queries.ts.

import type { Locale } from "./i18n";

export type Region = {
  code: string;
  name: string;
  nameEn: string;
  center: string;
  centerEn: string;
  summary: string;
  summaryEn: string;
  history: string;
  historyEn: string;
  culture: string;
  cultureEn: string;
  attractions: string[];
  attractionsEn: string[];
  imageId: number | null;
};

// What the public pages render, already in the visitor's language
export type RegionView = { code: string; name: string; center: string; summary: string; history: string; culture: string; attractions: string[]; imageId: number | null };

export function localizeRegion(r: Region, locale: Locale): RegionView {
  const en = locale === "en";
  // English attraction list is used only when it lines up with the Mongolian one
  const attractions = en && r.attractionsEn.length === r.attractions.length ? r.attractionsEn : r.attractions;
  return {
    code: r.code,
    name: en ? r.nameEn || r.name : r.name,
    center: en ? r.centerEn || r.center : r.center,
    summary: en ? r.summaryEn || r.summary : r.summary,
    history: en ? r.historyEn || r.history : r.history,
    culture: en ? r.cultureEn || r.culture : r.culture,
    attractions,
    imageId: r.imageId,
  };
}

export const HOTEL_CATEGORIES = ["lux", "a", "b", "camp", "ger", "guest"] as const;
export type HotelCategory = (typeof HOTEL_CATEGORIES)[number];

// Mongolian labels for the admin panel (the public site uses lib/i18n.ts)
export const HOTEL_CATEGORY_MN: Record<HotelCategory, string> = { lux: "Люкс", a: "А зэрэглэл", b: "Б зэрэглэл", camp: "Жуулчны бааз", ger: "Гэр кемп", guest: "Зочны байшин" };

export const HOTEL_AMENITIES = ["wifi", "breakfast", "restaurant", "parking", "hotwater", "pool", "spa", "shuttle"] as const;
export type HotelAmenity = (typeof HOTEL_AMENITIES)[number];

export type Hotel = {
  id: number;
  name: string;
  nameEn: string | null;
  regionCode: string;
  city: string;
  cityEn: string | null;
  stars: number;
  category: HotelCategory;
  pricePerNight: number;
  description: string;
  descriptionEn: string | null;
  amenities: HotelAmenity[];
  imageId: number | null;
  published: boolean;
};

export function localizeHotel(h: Hotel, locale: Locale): Hotel {
  if (locale !== "en") return h;
  return { ...h, name: h.nameEn || h.name, city: h.cityEn || h.city, description: h.descriptionEn || h.description };
}

export const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export const starsLabel = (n: number) => (n > 0 ? "★".repeat(n) : "");

export type HotelFilter = { region?: string; category?: string; stars?: string; price?: string; sort?: string };

export function filterHotels(list: Hotel[], f: HotelFilter): Hotel[] {
  const out = list.filter(
    (h) =>
      (!f.region || h.regionCode === f.region) &&
      (!f.category || h.category === f.category) &&
      (!f.stars || h.stars >= Number(f.stars)) &&
      (!f.price || h.pricePerNight <= Number(f.price)),
  );
  if (f.sort === "price-desc") out.sort((a, b) => b.pricePerNight - a.pricePerNight);
  else if (f.sort === "stars") out.sort((a, b) => b.stars - a.stars || a.pricePerNight - b.pricePerNight);
  else out.sort((a, b) => a.pricePerNight - b.pricePerNight);
  return out;
}
