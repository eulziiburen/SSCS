// Trip cost calculator. Pure and client-safe: the calculator page and the booking
// server action run the same function, so the quoted total is the booked total.

import type { Kind } from "./data";

export const CURRENCIES = ["USD", "EUR", "CNY", "KRW", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const ADDONS = ["sim", "insurance", "guide", "photo"] as const;
export type Addon = (typeof ADDONS)[number];

export type CalcSettings = {
  childPercent: number; // child price as % of the adult price
  singlePerNight: number; // single-room supplement per room per night, ₮
  addons: Record<Addon, number>; // ₮, unit per ADDON_UNIT
  rates: Record<Currency, number>; // ₮ per 1 unit of the currency
  ratesDate: string; // YYYY-MM-DD
};

// sim: per traveler (international only) · insurance: per traveler per day · guide/photo: per day for the group
export const ADDON_UNIT: Record<Addon, "person" | "personDay" | "day"> = {
  sim: "person",
  insurance: "personDay",
  guide: "day",
  photo: "day",
};

export const DEFAULT_CALC: CalcSettings = {
  childPercent: 80,
  singlePerNight: 90000,
  addons: { sim: 35000, insurance: 5000, guide: 150000, photo: 250000 },
  rates: { USD: 3450, EUR: 3850, CNY: 480, KRW: 2.5, JPY: 23 },
  ratesDate: "2026-09-27",
};

export type CalcTour = { price: number; days: number; kind: Kind; seats: number };

export type CalcInput = {
  adults: number;
  children: number;
  singleRooms: number;
  addons: Addon[];
};

export type Line = { key: "adults" | "children" | "single" | Addon; qty: number; unit: number; amount: number };

export function addonAvailable(addon: Addon, kind: Kind) {
  return addon !== "sim" || kind === "abroad";
}

const int = (v: unknown, min: number, max: number) => Math.min(max, Math.max(min, Math.floor(Number(v)) || 0));

// Clamps anything the browser sent into a valid request for this tour
export function normalizeInput(input: Partial<CalcInput>, tour: CalcTour): CalcInput {
  const adults = int(input.adults, 1, 10);
  const children = int(input.children, 0, 10);
  const nights = Math.max(0, tour.days - 1);
  return {
    adults,
    children,
    singleRooms: nights ? int(input.singleRooms, 0, adults) : 0,
    addons: ADDONS.filter((a) => input.addons?.includes(a) && addonAvailable(a, tour.kind)),
  };
}

export function calculate(tour: CalcTour, raw: Partial<CalcInput>, s: CalcSettings) {
  const input = normalizeInput(raw, tour);
  const travelers = input.adults + input.children;
  const nights = Math.max(0, tour.days - 1);
  const childUnit = Math.round((tour.price * s.childPercent) / 100);

  const lines: Line[] = [{ key: "adults", qty: input.adults, unit: tour.price, amount: tour.price * input.adults }];
  if (input.children) lines.push({ key: "children", qty: input.children, unit: childUnit, amount: childUnit * input.children });
  if (input.singleRooms) {
    const unit = s.singlePerNight * nights;
    lines.push({ key: "single", qty: input.singleRooms, unit, amount: unit * input.singleRooms });
  }
  for (const a of input.addons) {
    const price = s.addons[a];
    const qty = ADDON_UNIT[a] === "person" ? travelers : ADDON_UNIT[a] === "personDay" ? travelers * tour.days : tour.days;
    lines.push({ key: a, qty, unit: price, amount: price * qty });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { input, lines, travelers, total, perPerson: Math.round(total / travelers), overSeats: travelers > tour.seats };
}

export function convert(mnt: number, currency: Currency, s: CalcSettings) {
  return mnt / s.rates[currency];
}

export function fmtCurrency(value: number, currency: Currency) {
  return value.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2 });
}

// Merges stored settings over the defaults so a partial or older record still works
export function mergeCalc(stored: unknown): CalcSettings {
  const v = (stored && typeof stored === "object" ? stored : {}) as Partial<CalcSettings>;
  const num = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : d);
  return {
    childPercent: num(v.childPercent, DEFAULT_CALC.childPercent),
    singlePerNight: num(v.singlePerNight, DEFAULT_CALC.singlePerNight),
    addons: Object.fromEntries(ADDONS.map((a) => [a, num(v.addons?.[a], DEFAULT_CALC.addons[a])])) as Record<Addon, number>,
    rates: Object.fromEntries(CURRENCIES.map((c) => [c, num(v.rates?.[c], DEFAULT_CALC.rates[c]) || DEFAULT_CALC.rates[c]])) as Record<Currency, number>,
    ratesDate: typeof v.ratesDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.ratesDate) ? v.ratesDate : DEFAULT_CALC.ratesDate,
  };
}
