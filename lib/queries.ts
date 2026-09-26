import { asc, desc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/db/client";
import { bookings, news, tours, type TourRow } from "@/db/schema";
import { daysBetween, SCENE_KEYS, type NewsItem, type SceneKey, type Tour } from "./data";

export function toTour(row: TourRow): Tour {
  let route: string[] = [];
  try {
    route = JSON.parse(row.route);
  } catch {}
  return {
    ...row,
    scene: (SCENE_KEYS as readonly string[]).includes(row.scene) ? (row.scene as SceneKey) : "terelj",
    route,
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
