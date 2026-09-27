"use server";

import { revalidatePath } from "next/cache";
import { db, ensureDb } from "@/db/client";
import { bookings } from "@/db/schema";
import { calculate, type CalcInput } from "@/lib/calc";
import { isEmail, VOUCHER_AMOUNTS } from "@/lib/data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { DEFAULT_DIAL, dialByIso, formatPhone, isValidPhone } from "@/lib/phone";
import { HOTEL_CATEGORIES, HOTEL_CATEGORY_MN, type HotelCategory } from "@/lib/places";
import { getCalcSettings, getHotel, getHotels, getRegions, getTour } from "@/lib/queries";

// dial is the ISO country of the phone number (e.g. "MN"); missing means Mongolia for older clients
export type Contact = { lastName: string; firstName: string; phone: string; dial?: string; email: string; locale?: Locale };
type Common = Contact & { pax: number };
export type BookingInput =
  | ({ type: "tour"; tourId: number; calc?: Partial<CalcInput> } & Common)
  | ({ type: "voucher"; amount: number } & Common);

export type BookingResult = { ok: true; code: string } | { ok: false; error: string };

type Row = Omit<typeof bookings.$inferInsert, "code" | "name" | "lastName" | "firstName" | "phone" | "email" | "createdAt">;

// Mongolian labels for the admin's view of a booking
const ADDON_MN = { sim: "Дата сим", insurance: "Даатгал", guide: "Хувийн хөтөч", photo: "Зурагчин" } as const;
const TRANSPORT_MN = { car: "Жолоочтой машин", van: "Микроавтобус", bus: "Автобус", own: "Өөрийн унаа" } as const;

const messages = (locale: unknown) => getDictionary(isLocale(locale) ? locale : "mn").errors;

// Validates the shared contact fields; the same rules as the forms, re-checked on the server
function parseContact(input: Contact) {
  const msg = messages(input.locale);
  const lastName = String(input.lastName ?? "").trim().slice(0, 60);
  const firstName = String(input.firstName ?? "").trim().slice(0, 60);
  const dial = dialByIso(String(input.dial ?? "")) ?? DEFAULT_DIAL;
  const rawPhone = String(input.phone ?? "");
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!lastName || !firstName || !isValidPhone(dial.iso, rawPhone)) return { error: msg.input } as const;
  if (!isEmail(email)) return { error: msg.email } as const;
  // Mongolian order (surname first) for the admin's combined display
  return { contact: { lastName, firstName, name: `${lastName} ${firstName}`, phone: formatPhone(dial.iso, rawPhone), email } } as const;
}

async function save(contact: NonNullable<ReturnType<typeof parseContact>["contact"]>, row: Row, locale: unknown): Promise<BookingResult> {
  await ensureDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = "ST-" + Math.floor(100000 + Math.random() * 900000);
    try {
      await db.insert(bookings).values({ ...row, ...contact, code, createdAt: new Date().toISOString() });
      revalidatePath("/admin", "layout");
      return { ok: true, code };
    } catch (e) {
      if (!String(e).includes("UNIQUE")) throw e;
    }
  }
  return { ok: false, error: messages(locale).retry };
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const msg = messages(input.locale);
  const parsed = parseContact(input);
  if (!parsed.contact) return { ok: false, error: parsed.error };
  let pax = Math.floor(Number(input.pax));

  // Prices always come from the server, never from the browser
  if (input.type === "tour") {
    const tour = await getTour(Number(input.tourId));
    if (!tour || !tour.published) return { ok: false, error: msg.notFound };
    let total = tour.price * pax;
    let details: string | null = null;
    if (input.calc) {
      const r = calculate(tour, input.calc, await getCalcSettings());
      pax = r.travelers;
      total = r.total;
      const parts = [`Том ${r.input.adults}${r.input.children ? `, хүүхэд ${r.input.children}` : ""}`];
      if (r.input.singleRooms) parts.push(`Ганц өрөө ${r.input.singleRooms}`);
      if (r.input.addons.length) parts.push(r.input.addons.map((a) => ADDON_MN[a]).join(", "));
      details = parts.join(" · ");
    }
    if (!(pax >= 1 && pax <= 20)) return { ok: false, error: msg.pax };
    if (pax > tour.seats) return { ok: false, error: msg.seats(tour.seats) };
    return save(parsed.contact, { type: "tour", tourId: tour.id, tourTitle: tour.title, pax, unitPrice: tour.price, total, details }, input.locale);
  }

  if (!(pax >= 1 && pax <= 10)) return { ok: false, error: msg.pax };
  if (!VOUCHER_AMOUNTS.includes(Number(input.amount))) return { ok: false, error: msg.amount };
  const unit = Number(input.amount);
  return save(parsed.contact, { type: "voucher", tourTitle: "Аяллын эрхийн бичиг", pax, unitPrice: unit, total: unit * pax }, input.locale);
}

const isoDate = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const int = (v: unknown, min: number, max: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export async function createHotelBooking(input: Contact & { hotelId: number; checkIn: string; nights: number; rooms: number; guests: number }): Promise<BookingResult> {
  const msg = messages(input.locale);
  const parsed = parseContact(input);
  if (!parsed.contact) return { ok: false, error: parsed.error };
  const hotel = await getHotel(Number(input.hotelId));
  if (!hotel?.published) return { ok: false, error: msg.notFound };
  const checkIn = isoDate(input.checkIn);
  const nights = int(input.nights, 1, 30);
  const rooms = int(input.rooms, 1, 10);
  const guests = int(input.guests, 1, 40);
  if (!checkIn || !nights || !rooms || !guests) return { ok: false, error: msg.pax };
  return save(
    parsed.contact,
    {
      type: "hotel",
      tourTitle: hotel.name,
      pax: guests,
      unitPrice: hotel.pricePerNight,
      total: hotel.pricePerNight * nights * rooms,
      details: `${checkIn}-с ${nights} шөнө · ${rooms} өрөө`,
    },
    input.locale,
  );
}

export type CustomTripInput = Contact & {
  regions: string[];
  sights: string[]; // "regionCode:index" into that region's attraction list
  startDate: string;
  days: number;
  adults: number;
  children: number;
  accommodation: string; // HotelCategory or "" for no preference
  hotelIds: number[];
  transport: string;
  guide: boolean;
  notes: string;
};

export async function createCustomTrip(input: CustomTripInput): Promise<BookingResult> {
  const msg = messages(input.locale);
  const parsed = parseContact(input);
  if (!parsed.contact) return { ok: false, error: parsed.error };

  const allRegions = await getRegions();
  const chosen = allRegions.filter((r) => input.regions?.includes(r.code));
  const startDate = isoDate(input.startDate);
  const days = int(input.days, 1, 60);
  const adults = int(input.adults, 1, 40);
  const children = int(input.children, 0, 40);
  if (!chosen.length || !startDate || !days || !adults || children === null) return { ok: false, error: msg.pax };

  // Resolve sights to their Mongolian names so the admin always reads the same language
  const sights = (input.sights ?? []).flatMap((ref) => {
    const [code, i] = String(ref).split(":");
    const name = chosen.find((r) => r.code === code)?.attractions[Number(i)];
    return name ? [name] : [];
  });
  const hotelsById = new Map((await getHotels()).map((h) => [h.id, h]));
  const pickedHotels = (input.hotelIds ?? []).map((id) => hotelsById.get(Number(id))).filter((h) => h && chosen.some((r) => r.code === h.regionCode));
  const category = (HOTEL_CATEGORIES as readonly string[]).includes(input.accommodation) ? HOTEL_CATEGORY_MN[input.accommodation as HotelCategory] : null;
  const transport = TRANSPORT_MN[input.transport as keyof typeof TRANSPORT_MN] ?? null;
  const notes = String(input.notes ?? "").trim().slice(0, 1000);

  const details = [
    `${startDate}-с ${days} хоног`,
    `Том ${adults}${children ? `, хүүхэд ${children}` : ""}`,
    sights.length ? `Үзэх: ${sights.join(", ")}` : null,
    category ? `Байр: ${category}` : null,
    pickedHotels.length ? `Буудал: ${pickedHotels.map((h) => h!.name).join(", ")}` : null,
    transport ? `Тээвэр: ${transport}` : null,
    input.guide ? "Хөтөч хэрэгтэй" : null,
    notes ? `Тэмдэглэл: ${notes}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return save(
    parsed.contact,
    { type: "custom", tourTitle: `Өөрийн аялал: ${chosen.map((r) => r.name).join(", ")}`, pax: adults + children, unitPrice: 0, total: 0, details },
    input.locale,
  );
}
