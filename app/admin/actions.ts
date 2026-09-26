"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureDb } from "@/db/client";
import { bookings, news, tours } from "@/db/schema";
import { checkCredentials, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { BOOKING_STATUS, SCENE_KEYS, type BookingStatus } from "@/lib/data";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin/login");
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
    back("/admin/login", "Нэвтрэх нэр эсвэл нууц үг буруу байна.");
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
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
  const route = str(fd, "route")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

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

  if (id) {
    await db.update(tours).set(data).where(eq(tours.id, id));
  } else {
    await db.insert(tours).values(data);
  }
  refreshSite();
  redirect("/admin/tours?saved=1");
}

export async function deleteTour(fd: FormData) {
  await requireAuth();
  await db.delete(tours).where(eq(tours.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/tours");
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
  revalidatePath("/admin", "layout");
}

export async function saveBookingNote(fd: FormData) {
  await requireAuth();
  await db
    .update(bookings)
    .set({ note: str(fd, "note") || null })
    .where(eq(bookings.id, Number(fd.get("id"))));
  revalidatePath("/admin", "layout");
}

export async function deleteBooking(fd: FormData) {
  await requireAuth();
  await db.delete(bookings).where(eq(bookings.id, Number(fd.get("id"))));
  revalidatePath("/admin", "layout");
}

/* ---------- news ---------- */

export async function saveNews(fd: FormData) {
  await requireAuth();
  const id = Number(fd.get("id")) || null;
  const data = {
    date: str(fd, "date"),
    title: str(fd, "title"),
    text: str(fd, "text"),
    published: fd.get("published") === "on",
  };
  const path = id ? `/admin/news?edit=${id}` : "/admin/news";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) back(path, "Огноо буруу байна.");
  if (!data.title || !data.text) back(path, "Гарчиг болон агуулгыг бөглөнө үү.");

  if (id) await db.update(news).set(data).where(eq(news.id, id));
  else await db.insert(news).values(data);
  refreshSite();
  redirect("/admin/news");
}

export async function deleteNews(fd: FormData) {
  await requireAuth();
  await db.delete(news).where(eq(news.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/news");
}
