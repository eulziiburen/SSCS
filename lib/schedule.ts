// Day-by-day tour programme. The admin types plain text:
//
//   1-р өдөр: Улаанбаатар – Манжуур
//   08:00 Нисэх онгоцны буудалд цуглах
//   10:30–12:40 Манжуур руу нисэх
//   Орой чөлөөт цаг
//   2-р өдөр
//   ...
//
// A line starting with "N-р өдөр" / "N өдөр" / "Day N" opens a day (text after ":" or "—" is its title);
// "HH:MM" or "HH:MM–HH:MM" at the start of a line is a timed item; anything else is an untimed item.
// Client-safe.

export type ScheduleItem = { time: string | null; text: string };
export type ScheduleDay = { day: number; title: string; items: ScheduleItem[] };

const DAY_RE = /^(?:(\d{1,2})\s*(?:-?\s*р)?\s*өдөр|day\s*(\d{1,2}))\s*[:.–—-]?\s*(.*)$/i;
const TIME_RE = /^(\d{1,2})[:.](\d{2})(?:\s*[-–—]\s*(\d{1,2})[:.](\d{2}))?\s*[-–—:]?\s+(.+)$/;

const hhmm = (h: string, m: string) => `${h.padStart(2, "0")}:${m}`;

export function parseSchedule(text: string | null | undefined): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  for (const raw of (text ?? "").split(/\r?\n/)) {
    const line = raw.trim().replace(/^[•*-]\s+/, "");
    if (!line) continue;
    const d = DAY_RE.exec(line);
    if (d) {
      days.push({ day: Number(d[1] ?? d[2]), title: d[3].trim(), items: [] });
      continue;
    }
    // Items before any day heading belong to day 1
    if (!days.length) days.push({ day: 1, title: "", items: [] });
    const t = TIME_RE.exec(line);
    days.at(-1)!.items.push(t ? { time: hhmm(t[1], t[2]) + (t[3] ? `–${hhmm(t[3], t[4])}` : ""), text: t[5].trim() } : { time: null, text: line });
  }
  return days;
}

// "YYYY-MM-DD" + n days, as a Date at UTC midnight (the dates carry no time zone)
export function dayDate(startDate: string, dayNumber: number) {
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayNumber - 1);
  return d;
}

// When no programme was entered: one entry per day from the route, with no invented times
export function outlineFromRoute(route: string[], days: number): { day: number; stop: string; kind: "depart" | "stay" | "return" }[] {
  const n = Math.max(1, days);
  if (n === 1) return [{ day: 1, stop: route.slice(0, -1).join(" → ") || route[0] || "", kind: "depart" }];
  return Array.from({ length: n }, (_, i) => {
    const kind = i === 0 ? "depart" : i === n - 1 ? "return" : "stay";
    const idx = kind === "return" ? route.length - 1 : Math.min(route.length - 2, Math.max(i === 0 ? 0 : 1, Math.round((i * (route.length - 1)) / (n - 1))));
    return { day: i + 1, stop: route[idx] ?? "", kind };
  });
}

// Structured form used by the admin editor; round-trips through the text format above
export type EditRow = { start: string; end: string; text: string; textEn: string };
export type EditDay = { title: string; titleEn: string; rows: EditRow[] };

export function toEditDays(mn: string | null | undefined, en: string | null | undefined, fallbackDays = 1): EditDay[] {
  const mnDays = parseSchedule(mn);
  const enDays = parseSchedule(en);
  if (!mnDays.length) {
    return Array.from({ length: Math.max(1, Math.min(fallbackDays, 60)) }, () => ({ title: "", titleEn: "", rows: [{ start: "", end: "", text: "", textEn: "" }] }));
  }
  return mnDays.map((d, i) => ({
    title: d.title,
    titleEn: enDays[i]?.title ?? "",
    rows: d.items.map((it, j) => {
      const [start = "", end = ""] = (it.time ?? "").split("–");
      return { start, end, text: it.text, textEn: enDays[i]?.items[j]?.text ?? "" };
    }),
  }));
}

export function fromEditDays(days: EditDay[]): { mn: string; en: string } {
  const line = (r: EditRow, text: string) => (r.start ? `${r.start}${r.end ? `–${r.end}` : ""} ${text}` : text);
  const kept = days.map((d) => ({ ...d, rows: d.rows.filter((r) => r.text.trim()) })).filter((d) => d.rows.length || d.title.trim());
  const mn = kept.flatMap((d, i) => [`${i + 1}-р өдөр${d.title.trim() ? `: ${d.title.trim()}` : ""}`, ...d.rows.map((r) => line(r, r.text.trim()))]).join("\n");
  const hasEn = kept.some((d) => d.titleEn.trim() || d.rows.some((r) => r.textEn.trim()));
  // Rows without an English text fall back to the Mongolian one so the English schedule never has gaps
  const en = hasEn
    ? kept.flatMap((d, i) => [`Day ${i + 1}${d.titleEn.trim() ? `: ${d.titleEn.trim()}` : ""}`, ...d.rows.map((r) => line(r, r.textEn.trim() || r.text.trim()))]).join("\n")
    : "";
  return { mn, en };
}
