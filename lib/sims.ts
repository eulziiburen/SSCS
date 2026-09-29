// Data-SIM / eSIM plans shown under Services → Data SIM. Client-safe.

export const SIM_KINDS = ["daily", "total", "unlimited"] as const;
export type SimKind = (typeof SIM_KINDS)[number];

export const SIM_ACTIVATION = ["anytime", "date"] as const;
export type SimActivation = (typeof SIM_ACTIVATION)[number];

export type SimPlan = {
  id: number;
  countries: string[]; // ISO codes, see lib/countries.ts
  title: string;
  titleEn: string | null;
  kind: SimKind;
  dataAmount: string; // "500MB", "3GB"; unused for unlimited
  days: number;
  activation: SimActivation;
  activateWithin: number | null; // must be switched on within this many days of purchase
  price: number;
  published: boolean;
  sortOrder: number;
};

export const SIM_KIND_MN: Record<SimKind, string> = { daily: "Өдрийн", total: "Нийт дата", unlimited: "Хязгааргүй" };
export const SIM_ACTIVATION_MN: Record<SimActivation, string> = { anytime: "Хүссэн үедээ асаана", date: "Тодорхой өдрөөс идэвхжинэ" };

// A stored JSON array, or admin text like "us, ca mx" → ["US", "CA", "MX"]; two-letter codes only
export function parseCountries(v: string | null | undefined): string[] {
  try {
    const arr = JSON.parse(v ?? "[]");
    if (Array.isArray(arr)) return [...new Set(arr.map((x) => String(x).toUpperCase()).filter((x) => /^[A-Z]{2}$/.test(x)))];
  } catch {}
  return [...new Set(String(v ?? "").toUpperCase().split(/[^A-Z]+/).filter((x) => /^[A-Z]{2}$/.test(x)))];
}

// "Өдөрт 500MB · 7 хоног" — the admin's reading of a plan
export function simSpecMn(p: Pick<SimPlan, "kind" | "dataAmount" | "days">) {
  const data = p.kind === "unlimited" ? "Хязгааргүй дата" : p.kind === "daily" ? `Өдөрт ${p.dataAmount}` : `Нийт ${p.dataAmount}`;
  return `${data} · ${p.days} хоног`;
}
