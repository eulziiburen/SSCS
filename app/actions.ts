"use server";

import { revalidatePath } from "next/cache";
import { db, ensureDb } from "@/db/client";
import { bookings } from "@/db/schema";
import { VOUCHER_AMOUNTS } from "@/lib/data";
import { getTour } from "@/lib/queries";

export type BookingInput = { type: "tour"; tourId: number; name: string; phone: string; pax: number } | { type: "voucher"; amount: number; name: string; phone: string; pax: number };

export type BookingResult = { ok: true; code: string } | { ok: false; error: string };

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const name = String(input.name ?? "").trim().slice(0, 120);
  const phone = String(input.phone ?? "").replace(/\D/g, "");
  const pax = Math.floor(Number(input.pax));
  if (!name || phone.length !== 8) return { ok: false, error: "Нэр болон 8 оронтой утасны дугаараа оруулна уу." };
  if (!(pax >= 1 && pax <= 10)) return { ok: false, error: "Хүний тоо буруу байна." };

  // Prices always come from the server, never from the browser
  let unitPrice: number;
  let tourId: number | null = null;
  let tourTitle: string;
  if (input.type === "tour") {
    const tour = await getTour(Number(input.tourId));
    if (!tour || !tour.published) return { ok: false, error: "Аялал олдсонгүй." };
    if (pax > tour.seats) return { ok: false, error: `Үлдэгдэл ${tour.seats} суудал байна.` };
    unitPrice = tour.price;
    tourId = tour.id;
    tourTitle = tour.title;
  } else {
    if (!VOUCHER_AMOUNTS.includes(Number(input.amount))) return { ok: false, error: "Дүн буруу байна." };
    unitPrice = Number(input.amount);
    tourTitle = "Аяллын эрхийн бичиг";
  }

  await ensureDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = "ТА-" + Math.floor(100000 + Math.random() * 900000);
    try {
      await db.insert(bookings).values({
        code,
        type: input.type,
        tourId,
        tourTitle,
        name,
        phone: `${phone.slice(0, 4)} ${phone.slice(4)}`,
        pax,
        unitPrice,
        total: unitPrice * pax,
        createdAt: new Date().toISOString(),
      });
      revalidatePath("/admin", "layout");
      return { ok: true, code };
    } catch (e) {
      if (!String(e).includes("UNIQUE")) throw e;
    }
  }
  return { ok: false, error: "Түр алдаа гарлаа. Дахин оролдоно уу." };
}
