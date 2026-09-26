"use server";

import { revalidatePath } from "next/cache";
import { db, ensureDb } from "@/db/client";
import { bookings } from "@/db/schema";
import { calculate, type CalcInput } from "@/lib/calc";
import { isEmail, VOUCHER_AMOUNTS } from "@/lib/data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { DEFAULT_DIAL, dialByIso, formatPhone, isValidPhone } from "@/lib/phone";
import { getCalcSettings, getTour } from "@/lib/queries";

// dial is the ISO country of the phone number (e.g. "MN"); missing means Mongolia for older clients
type Common = { name: string; phone: string; dial?: string; email: string; pax: number; locale?: Locale };
export type BookingInput =
  | ({ type: "tour"; tourId: number; calc?: Partial<CalcInput> } & Common)
  | ({ type: "voucher"; amount: number } & Common);

export type BookingResult = { ok: true; code: string } | { ok: false; error: string };

// Mongolian labels for the admin's view of a calculator booking
const ADDON_MN = { sim: "Дата сим", insurance: "Даатгал", guide: "Хувийн хөтөч", photo: "Зурагчин" } as const;

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const msg = getDictionary(isLocale(input.locale) ? input.locale : "mn").errors;
  const name = String(input.name ?? "").trim().slice(0, 120);
  const dial = dialByIso(String(input.dial ?? "")) ?? DEFAULT_DIAL;
  const rawPhone = String(input.phone ?? "");
  let pax = Math.floor(Number(input.pax));
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!name || !isValidPhone(dial.iso, rawPhone)) return { ok: false, error: msg.input };
  const phone = formatPhone(dial.iso, rawPhone);
  if (!isEmail(email)) return { ok: false, error: msg.email };

  // Prices always come from the server, never from the browser
  let unitPrice: number;
  let total: number;
  let tourId: number | null = null;
  let tourTitle: string;
  let details: string | null = null;
  if (input.type === "tour") {
    const tour = await getTour(Number(input.tourId));
    if (!tour || !tour.published) return { ok: false, error: msg.notFound };
    unitPrice = tour.price;
    tourId = tour.id;
    tourTitle = tour.title;
    if (input.calc) {
      const r = calculate(tour, input.calc, await getCalcSettings());
      pax = r.travelers;
      total = r.total;
      const parts = [`Том ${r.input.adults}${r.input.children ? `, хүүхэд ${r.input.children}` : ""}`];
      if (r.input.singleRooms) parts.push(`Ганц өрөө ${r.input.singleRooms}`);
      if (r.input.addons.length) parts.push(r.input.addons.map((a) => ADDON_MN[a]).join(", "));
      details = parts.join(" · ");
    } else {
      total = unitPrice * pax;
    }
    if (!(pax >= 1 && pax <= 20)) return { ok: false, error: msg.pax };
    if (pax > tour.seats) return { ok: false, error: msg.seats(tour.seats) };
  } else {
    if (!(pax >= 1 && pax <= 10)) return { ok: false, error: msg.pax };
    if (!VOUCHER_AMOUNTS.includes(Number(input.amount))) return { ok: false, error: msg.amount };
    unitPrice = Number(input.amount);
    total = unitPrice * pax;
    tourTitle = "Аяллын эрхийн бичиг";
  }

  await ensureDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = "ST-" + Math.floor(100000 + Math.random() * 900000);
    try {
      await db.insert(bookings).values({
        code,
        type: input.type,
        tourId,
        tourTitle,
        name,
        phone,
        email,
        pax,
        unitPrice,
        total,
        details,
        createdAt: new Date().toISOString(),
      });
      revalidatePath("/admin", "layout");
      return { ok: true, code };
    } catch (e) {
      if (!String(e).includes("UNIQUE")) throw e;
    }
  }
  return { ok: false, error: msg.retry };
}
