// "Soft Travel in numbers" strip on the home page, editable in admin

export type Stat = { value: string; mn: string; en: string };

export const MAX_STATS = 4;

export const DEFAULT_STATS: Stat[] = [
  { value: "12+", mn: "жил туршлага", en: "years of experience" },
  { value: "18,000+", mn: "аялагч", en: "travelers" },
  { value: "4.9 / 5", mn: "дундаж үнэлгээ", en: "average rating" },
  { value: "24/7", mn: "аяллын үеийн дэмжлэг", en: "support while you travel" },
];

// Rows with an empty value are dropped, so an admin can show fewer than four
export function mergeStats(stored: unknown): Stat[] {
  if (!Array.isArray(stored)) return DEFAULT_STATS;
  return stored
    .slice(0, MAX_STATS)
    .map((s) => ({ value: String(s?.value ?? "").trim(), mn: String(s?.mn ?? "").trim(), en: String(s?.en ?? "").trim() }))
    .filter((s) => s.value);
}
