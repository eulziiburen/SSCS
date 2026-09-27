import { asc, desc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/db/client";
import { bookings, hotels, news, regions, settings, tours, type HotelRow, type RegionRow, type TourRow } from "@/db/schema";
import { HOTEL_AMENITIES, HOTEL_CATEGORIES, lines, type Hotel, type HotelAmenity, type HotelCategory, type Region } from "./places";
import { mergeCalc, type CalcSettings } from "./calc";
import { mergeStats, type Stat } from "./stats";
import { daysBetween, SCENE_KEYS, type NewsItem, type SceneKey, type Tour } from "./data";

function parseList(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function toTour(row: TourRow): Tour {
  return {
    ...row,
    scene: (SCENE_KEYS as readonly string[]).includes(row.scene) ? (row.scene as SceneKey) : "terelj",
    route: parseList(row.route),
    routeEn: parseList(row.routeEn),
    days: daysBetween(row.startDate, row.endDate),
  };
}

export async function getTours({ includeHidden = false } = {}): Promise<Tour[]> {
  await ensureDb();
  const rows = includeHidden
    ? await db.select().from(tours).orderBy(asc(tours.startDate))
    : await db.select().from(tours).where(eq(tours.published, true)).orderBy(asc(tours.startDate));
  return rows.map(toTour);
}

export async function getTour(id: number): Promise<Tour | undefined> {
  if (!Number.isInteger(id)) return undefined;
  await ensureDb();
  const [row] = await db.select().from(tours).where(eq(tours.id, id));
  return row ? toTour(row) : undefined;
}

export async function getNews({ includeHidden = false } = {}): Promise<NewsItem[]> {
  await ensureDb();
  const q = db.select().from(news).orderBy(desc(news.date), desc(news.id));
  const rows = await q;
  return includeHidden ? rows : rows.filter((n) => n.published);
}

export async function getBookings() {
  await ensureDb();
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function getCalcSettings(): Promise<CalcSettings> {
  await ensureDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "calc"));
  try {
    return mergeCalc(row ? JSON.parse(row.value) : null);
  } catch {
    return mergeCalc(null);
  }
}

export async function getHomeStats(): Promise<Stat[]> {
  await ensureDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "stats"));
  try {
    return mergeStats(row ? JSON.parse(row.value) : null);
  } catch {
    return mergeStats(null);
  }
}

export function toRegion(row: RegionRow): Region {
  return { ...row, attractions: lines(row.attractions), attractionsEn: lines(row.attractionsEn) };
}

export async function getRegions(): Promise<Region[]> {
  await ensureDb();
  return (await db.select().from(regions).orderBy(asc(regions.name))).map(toRegion);
}

export async function getRegion(code: string): Promise<Region | undefined> {
  await ensureDb();
  const [row] = await db.select().from(regions).where(eq(regions.code, code));
  return row ? toRegion(row) : undefined;
}

function toHotel(row: HotelRow): Hotel {
  const amenities = parseList(row.amenities).filter((a): a is HotelAmenity => (HOTEL_AMENITIES as readonly string[]).includes(a));
  const category = (HOTEL_CATEGORIES as readonly string[]).includes(row.category) ? (row.category as HotelCategory) : "b";
  return { ...row, amenities, category };
}

export async function getHotels({ includeHidden = false } = {}): Promise<Hotel[]> {
  await ensureDb();
  const rows = await db.select().from(hotels).orderBy(asc(hotels.pricePerNight));
  return rows.map(toHotel).filter((h) => includeHidden || h.published);
}

export async function getHotel(id: number): Promise<Hotel | undefined> {
  if (!Number.isInteger(id)) return undefined;
  await ensureDb();
  const [row] = await db.select().from(hotels).where(eq(hotels.id, id));
  return row ? toHotel(row) : undefined;
}
