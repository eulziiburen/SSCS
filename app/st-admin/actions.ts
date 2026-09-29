"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureDb } from "@/db/client";
import { bookings, hotels, images, news, regions, reviews, settings, tours, users } from "@/db/schema";
import { HOTEL_AMENITIES, HOTEL_CATEGORIES } from "@/lib/places";
import { ADDONS, CURRENCIES, mergeCalc } from "@/lib/calc";
import { MAX_STATS, mergeStats } from "@/lib/stats";
import { checkCredentials, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { BOOKING_STATUS, SCENE_KEYS, type BookingStatus } from "@/lib/data";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/st-admin/login");
  await ensureDb();
}

// Admin edits change what every public page shows
function refreshSite() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const back = (path: string, error: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(error)}`);

export async function login(fd: FormData) {
  if (!checkCredentials(str(fd, "username"), String(fd.get("password") ?? ""))) {
    back("/st-admin/login", "Нэвтрэх нэр эсвэл нууц үг буруу байна.");
  }
  await createSession();
  redirect("/st-admin");
}

export async function logout() {
  await destroySession();
  redirect("/st-admin/login");
}

/* ---------- tours ---------- */

export type TourFormState = { error: string; values: Record<string, string> } | null;

export async function saveTour(_prev: TourFormState, fd: FormData): Promise<TourFormState> {
  await requireAuth();
  const id = Number(fd.get("id")) || null;
  // Echo the submitted values back so a validation error doesn't wipe the form
  const fail = (error: string): TourFormState => ({
    error,
    values: Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string")),
  });

  const kind = str(fd, "kind");
  const scene = str(fd, "scene");
  const startDate = str(fd, "startDate");
  const endDate = str(fd, "endDate") || startDate;
  const price = Number(str(fd, "price").replace(/[^\d]/g, ""));
  const seats = Number(str(fd, "seats"));
  const lines = (k: string) =>
    str(fd, k)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  const route = lines("route");
  const routeEn = lines("routeEn");

  const data = {
    kind: kind as "abroad" | "local" | "day",
    scene: (SCENE_KEYS as readonly string[]).includes(scene) ? scene : "terelj",
    country: str(fd, "country"),
    title: str(fd, "title"),
    startDate,
    endDate,
    seats,
    price,
    route: JSON.stringify(route),
    badge: str(fd, "badge") || null,
    hot: fd.get("hot") === "on",
    featured: fd.get("featured") === "on",
    heroEyebrow: str(fd, "heroEyebrow") || null,
    titleEn: str(fd, "titleEn") || null,
    countryEn: str(fd, "countryEn") || null,
    routeEn: routeEn.length ? JSON.stringify(routeEn) : null,
    heroEyebrowEn: str(fd, "heroEyebrowEn") || null,
    schedule: str(fd, "schedule") || null,
    scheduleEn: str(fd, "scheduleEn") || null,
    upcoming: fd.get("upcoming") === "on",
    published: fd.get("published") === "on",
  };

  if (!["abroad", "local", "day"].includes(kind)) return fail("Аяллын төрөл сонгоно уу.");
  if (!data.title || !data.country) return fail("Гарчиг болон чиглэлийг бөглөнө үү.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return fail("Огноо буруу байна.");
  if (endDate < startDate) return fail("Дуусах огноо эхлэх огнооноос өмнө байна.");
  if (!(price > 0)) return fail("Үнэ оруулна уу.");
  if (!(Number.isInteger(seats) && seats >= 0)) return fail("Суудлын тоо буруу байна.");
  if (route.length < 2) return fail("Маршрутад дор хаяж 2 цэг оруулна уу (мөр бүрт нэг).");
  if (routeEn.length && routeEn.length !== route.length) return fail(`Англи маршрут монголтой ижил тооны цэгтэй байх ёстой (${route.length}).`);

  const [existing] = id ? await db.select({ imageId: tours.imageId }).from(tours).where(eq(tours.id, id)) : [];
  const image = await resolveImage(fd, existing?.imageId ?? null);
  if ("error" in image) return fail(image.error);

  if (id) {
    await db.update(tours).set({ ...data, imageId: image.imageId }).where(eq(tours.id, id));
  } else {
    await db.insert(tours).values({ ...data, imageId: image.imageId });
  }
  await dropReplacedImage(existing?.imageId ?? null, image.imageId);
  refreshSite();
  redirect("/st-admin/tours?saved=1");
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

// Reads the ImageField ("image" file + "imageRemove" flag) and stores a new upload.
// Returns the image id the record should point at afterwards.
async function resolveImage(fd: FormData, currentId: number | null): Promise<{ imageId: number | null } | { error: string }> {
  const upload = fd.get("image");
  if (upload instanceof File && upload.size > 0) {
    if (!IMAGE_TYPES.includes(upload.type)) return { error: "Зөвхөн JPG, PNG, WebP зураг оруулна уу." };
    if (upload.size > MAX_IMAGE_BYTES) return { error: "Зураг хэт том байна (3.5MB-аас бага байх ёстой)." };
    const [img] = await db
      .insert(images)
      .values({ mime: upload.type, data: Buffer.from(await upload.arrayBuffer()), createdAt: new Date().toISOString() })
      .returning({ id: images.id });
    return { imageId: img.id };
  }
  return { imageId: fd.get("imageRemove") === "1" ? null : currentId };
}

// The old photo is no longer referenced once replaced or removed
async function dropReplacedImage(oldId: number | null, newId: number | null) {
  if (oldId && oldId !== newId) await db.delete(images).where(eq(images.id, oldId));
}

export async function deleteTour(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id"));
  const [tour] = await db.select({ imageId: tours.imageId }).from(tours).where(eq(tours.id, id));
  await db.delete(tours).where(eq(tours.id, id));
  if (tour?.imageId) await db.delete(images).where(eq(images.id, tour.imageId));
  refreshSite();
  redirect("/st-admin/tours");
}

export async function toggleTour(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id"));
  const field = str(fd, "field");
  if (field !== "published" && field !== "featured" && field !== "upcoming") return;
  await db.update(tours).set({ [field]: fd.get("value") === "1" }).where(eq(tours.id, id));
  refreshSite();
}

/* ---------- bookings ---------- */

export async function setBookingStatus(fd: FormData) {
  await requireAuth();
  const status = str(fd, "status");
  if (!(status in BOOKING_STATUS)) return;
  await db
    .update(bookings)
    .set({ status: status as BookingStatus })
    .where(eq(bookings.id, Number(fd.get("id"))));
  revalidatePath("/st-admin", "layout");
}

export async function saveBookingNote(fd: FormData) {
  await requireAuth();
  await db
    .update(bookings)
    .set({ note: str(fd, "note") || null })
    .where(eq(bookings.id, Number(fd.get("id"))));
  revalidatePath("/st-admin", "layout");
}

export async function deleteBooking(fd: FormData) {
  await requireAuth();
  await db.delete(bookings).where(eq(bookings.id, Number(fd.get("id"))));
  revalidatePath("/st-admin", "layout");
}

/* ---------- news ---------- */

export async function saveNews(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id")) || null;
  const data = {
    date: str(fd, "date"),
    title: str(fd, "title"),
    text: str(fd, "text"),
    titleEn: str(fd, "titleEn") || null,
    textEn: str(fd, "textEn") || null,
    published: fd.get("published") === "on",
  };
  const path = id ? `/st-admin/news?edit=${id}` : "/st-admin/news";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) back(path, "Огноо буруу байна.");
  if (!data.title || !data.text) back(path, "Гарчиг болон агуулгыг бөглөнө үү.");

  if (id) await db.update(news).set(data).where(eq(news.id, id));
  else await db.insert(news).values(data);
  refreshSite();
  redirect("/st-admin/news");
}

export async function deleteNews(fd: FormData) {
  await requireAuth();
  await db.delete(news).where(eq(news.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/st-admin/news");
}

/* ---------- calculator settings ---------- */

export async function saveCalcSettings(fd: FormData) {
  await requireAuth();
  const n = (k: string) => Number(str(fd, k).replace(/[^\d.]/g, ""));
  const value = mergeCalc({
    childPercent: Math.min(100, n("childPercent")),
    singlePerNight: n("singlePerNight"),
    addons: Object.fromEntries(ADDONS.map((a) => [a, n(`addon_${a}`)])),
    rates: Object.fromEntries(CURRENCIES.map((c) => [c, n(`rate_${c}`)])),
    ratesDate: str(fd, "ratesDate"),
  });
  await db
    .insert(settings)
    .values({ key: "calc", value: JSON.stringify(value) })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } });
  refreshSite();
  redirect("/st-admin/settings?saved=1");
}

/* ---------- home page numbers ---------- */

export async function saveStats(fd: FormData) {
  await requireAuth();
  const rows = Array.from({ length: MAX_STATS }, (_, i) => ({ value: str(fd, `value${i}`), mn: str(fd, `mn${i}`), en: str(fd, `en${i}`) }));
  const value = JSON.stringify(mergeStats(rows));
  await db.insert(settings).values({ key: "stats", value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  refreshSite();
  redirect("/st-admin/home?saved=1");
}

/* ---------- hotels ---------- */

export type HotelFormState = { error: string; values: Record<string, string> } | null;

export async function saveHotel(_prev: HotelFormState, fd: FormData): Promise<HotelFormState> {
  await requireAuth();
  const id = Number(fd.get("id")) || null;
  const fail = (error: string): HotelFormState => ({
    error,
    values: {
      ...Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string")),
      // checkboxes share a name, so rebuild the list for the form
      amenities: fd.getAll("amenities").map(String).join(","),
    },
  });

  const category = str(fd, "category");
  const regionCode = str(fd, "regionCode");
  const stars = Number(str(fd, "stars"));
  const pricePerNight = Number(str(fd, "pricePerNight").replace(/[^\d]/g, ""));
  const data = {
    name: str(fd, "name"),
    nameEn: str(fd, "nameEn") || null,
    regionCode,
    city: str(fd, "city"),
    cityEn: str(fd, "cityEn") || null,
    stars,
    category,
    pricePerNight,
    description: str(fd, "description"),
    descriptionEn: str(fd, "descriptionEn") || null,
    amenities: JSON.stringify(fd.getAll("amenities").map(String).filter((a) => (HOTEL_AMENITIES as readonly string[]).includes(a))),
    published: fd.get("published") === "on",
  };

  if (!data.name || !data.city) return fail("Нэр болон хотыг бөглөнө үү.");
  if (!(await db.select({ code: regions.code }).from(regions).where(eq(regions.code, regionCode))).length) return fail("Аймаг сонгоно уу.");
  if (!(HOTEL_CATEGORIES as readonly string[]).includes(category)) return fail("Зэрэглэл сонгоно уу.");
  if (!(Number.isInteger(stars) && stars >= 0 && stars <= 5)) return fail("Одны тоо 0–5 байна.");
  if (!(pricePerNight > 0)) return fail("Шөнийн үнэ оруулна уу.");

  const [existing] = id ? await db.select({ imageId: hotels.imageId }).from(hotels).where(eq(hotels.id, id)) : [];
  const image = await resolveImage(fd, existing?.imageId ?? null);
  if ("error" in image) return fail(image.error);

  if (id) await db.update(hotels).set({ ...data, imageId: image.imageId }).where(eq(hotels.id, id));
  else await db.insert(hotels).values({ ...data, imageId: image.imageId });
  await dropReplacedImage(existing?.imageId ?? null, image.imageId);
  refreshSite();
  redirect("/st-admin/hotels?saved=1");
}

export async function deleteHotel(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id"));
  const [hotel] = await db.select({ imageId: hotels.imageId }).from(hotels).where(eq(hotels.id, id));
  await db.delete(hotels).where(eq(hotels.id, id));
  await dropReplacedImage(hotel?.imageId ?? null, null);
  refreshSite();
  redirect("/st-admin/hotels");
}

export async function toggleHotel(fd: FormData) {
  await requireAuth();
  await db
    .update(hotels)
    .set({ published: fd.get("value") === "1" })
    .where(eq(hotels.id, Number(fd.get("id"))));
  refreshSite();
}

/* ---------- regions (map content) ---------- */

export async function saveRegion(fd: FormData) {
  await requireAuth();
  const code = str(fd, "code");
  const [existing] = await db.select({ imageId: regions.imageId }).from(regions).where(eq(regions.code, code));
  if (!existing) redirect("/st-admin/regions");
  const path = `/st-admin/regions/${code}`;
  const data = {
    name: str(fd, "name"),
    nameEn: str(fd, "nameEn"),
    center: str(fd, "center"),
    centerEn: str(fd, "centerEn"),
    summary: str(fd, "summary"),
    summaryEn: str(fd, "summaryEn"),
    history: str(fd, "history"),
    historyEn: str(fd, "historyEn"),
    culture: str(fd, "culture"),
    cultureEn: str(fd, "cultureEn"),
    attractions: str(fd, "attractions"),
    attractionsEn: str(fd, "attractionsEn"),
  };
  if (!data.name || !data.nameEn) back(path, "Монгол, англи нэрийг бөглөнө үү.");
  const image = await resolveImage(fd, existing.imageId);
  if ("error" in image) back(path, image.error);
  const imageId = "imageId" in image ? image.imageId : existing.imageId;
  await db.update(regions).set({ ...data, imageId }).where(eq(regions.code, code));
  await dropReplacedImage(existing.imageId, imageId);
  refreshSite();
  redirect("/st-admin/regions?saved=1");
}

/* ---------- reviews ---------- */

const REVIEW_STATUS = ["pending", "approved", "hidden"] as const;

export async function setReviewStatus(fd: FormData) {
  await requireAuth();
  const status = str(fd, "status");
  if (!(REVIEW_STATUS as readonly string[]).includes(status)) return;
  await db.update(reviews).set({ status: status as (typeof REVIEW_STATUS)[number] }).where(eq(reviews.id, Number(fd.get("id"))));
  refreshSite();
}

export async function deleteReview(fd: FormData) {
  await requireAuth();
  await db.delete(reviews).where(eq(reviews.id, Number(fd.get("id"))));
  refreshSite();
}

/* ---------- traveler accounts ---------- */

// Bookings stay (the office still needs them); they just lose the link to the account
export async function deleteUser(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id"));
  await db.update(bookings).set({ userId: null }).where(eq(bookings.userId, id));
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/st-admin/users");
}
