import type { Metadata } from "next";
import Link from "next/link";
import { BookButton } from "@/components/Booking";
import { fmt, localizeTour, type Kind, type Tour } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { getTours } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.cal.metaTitle, description: t.cal.lead };
}

const KINDS: Kind[] = ["abroad", "local", "day"];

// Dates are plain "YYYY-MM-DD" strings; arithmetic happens in UTC so time zones never shift a day
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const dayIndex = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const hue = (id: number) => (id * 67 + 200) % 360;

type Bar = { tour: Tour; col: number; span: number; lane: number; continues: boolean; carries: boolean };

// Lays one week's tours into lanes so overlapping trips stack instead of colliding
function weekBars(tours: Tour[], weekStart: string): { bars: Bar[]; lanes: number } {
  const weekEnd = addDays(weekStart, 6);
  const laneEnds: string[] = [];
  const bars: Bar[] = [];
  const inWeek = tours
    .filter((x) => x.startDate <= weekEnd && x.endDate >= weekStart)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || b.endDate.localeCompare(a.endDate));
  for (const tour of inWeek) {
    const from = tour.startDate < weekStart ? weekStart : tour.startDate;
    const to = tour.endDate > weekEnd ? weekEnd : tour.endDate;
    let lane = laneEnds.findIndex((end) => end < from);
    if (lane === -1) lane = laneEnds.push(to) - 1;
    else laneEnds[lane] = to;
    bars.push({ tour, col: dayIndex(weekStart, from), span: dayIndex(from, to) + 1, lane, continues: tour.startDate < weekStart, carries: tour.endDate > weekEnd });
  }
  return { bars, lanes: laneEnds.length };
}

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const [{ m, kind }, { locale, t }, raw] = await Promise.all([searchParams, getI18n(), getTours()]);
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ulaanbaatar" });
  const month = typeof m === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : today.slice(0, 7);
  const [y, mo] = month.split("-").map(Number);
  const k = (KINDS as string[]).includes(String(kind)) ? (kind as Kind) : null;
  const tours = raw.map((x) => localizeTour(x, locale)).filter((x) => !k || x.kind === k);

  const first = `${month}-01`;
  const last = iso(new Date(Date.UTC(y, mo, 0)));
  // Weeks run Monday–Sunday, as on Mongolian calendars
  const gridStart = addDays(first, -((new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7));
  const weeks: string[] = [];
  for (let w = gridStart; w <= last; w = addDays(w, 7)) weeks.push(w);

  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, mo - 1 + n, 1));
    return iso(d).slice(0, 7);
  };
  const href = (nextMonth: string, nextKind: Kind | null = k) => `/calendar?m=${nextMonth}${nextKind ? `&kind=${nextKind}` : ""}`;
  const starting = tours.filter((x) => x.startDate.startsWith(month)).sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.calendar}</span>
      </nav>
      <h1 className="page-title">{t.cal.title}</h1>
      <p className="page-lead">{t.cal.lead}</p>

      <div className="cal-bar">
        <div className="cal-nav">
          <Link href={href(shift(-1))} className="icon-btn" aria-label={t.cal.prev} title={t.cal.prev} scroll={false}>
            ‹
          </Link>
          <h2 aria-live="polite">{t.cal.month(y, mo)}</h2>
          <Link href={href(shift(1))} className="icon-btn" aria-label={t.cal.next} title={t.cal.next} scroll={false}>
            ›
          </Link>
          {month !== today.slice(0, 7) && (
            <Link href={href(today.slice(0, 7))} className="btn ghost sm" scroll={false}>
              {t.cal.today}
            </Link>
          )}
        </div>
        <div className="chips">
          <Link href={href(month, null)} className="chip" aria-current={!k ? "true" : undefined} scroll={false}>
            {t.cal.all}
          </Link>
          {KINDS.map((x) => (
            <Link key={x} href={href(month, x)} className="chip" aria-current={k === x ? "true" : undefined} scroll={false}>
              {t.kind[x]}
            </Link>
          ))}
        </div>
      </div>

      <div className="cal" role="grid" aria-label={t.cal.month(y, mo)}>
        <div className="cal-head" role="row">
          {t.cal.weekdays.map((d, i) => (
            <span key={d} role="columnheader" className={i >= 5 ? "we" : undefined}>
              {d}
            </span>
          ))}
        </div>
        {weeks.map((w) => {
          const { bars, lanes } = weekBars(tours, w);
          return (
            <div key={w} className="cal-week" role="row" style={{ gridTemplateRows: `var(--cal-num) repeat(${Math.max(lanes, 1)}, 26px) minmax(8px, 1fr)` }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(w, i);
                const cls = ["cal-day", d.slice(0, 7) !== month && "out", d === today && "today", d < today && "past", i >= 5 && "we"].filter(Boolean).join(" ");
                return (
                  <div key={d} role="gridcell" className={cls} style={{ gridColumn: i + 1, gridRow: "1 / -1" }}>
                    <time dateTime={d}>{Number(d.slice(8))}</time>
                  </div>
                );
              })}
              {bars.map((b) => (
                <Link
                  key={b.tour.id}
                  href={`/tours/${b.tour.id}`}
                  className={`cal-ev${b.continues ? " cont" : ""}${b.carries ? " carry" : ""}${b.tour.endDate < today ? " done" : ""}`}
                  style={{ gridColumn: `${b.col + 1} / span ${b.span}`, gridRow: b.lane + 2, "--h": hue(b.tour.id) } as React.CSSProperties}
                  title={`${b.tour.title} · ${b.tour.startDate.slice(5).replace("-", ".")}–${b.tour.endDate.slice(5).replace("-", ".")}`}
                >
                  <span>{b.tour.title}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <section className="cal-list" aria-labelledby="cal-list-h">
        <h2 id="cal-list-h">{t.cal.listTitle(starting.length)}</h2>
        {starting.length === 0 ? (
          <p className="cal-empty">
            {t.cal.empty}{" "}
            <Link href={href(shift(1))} scroll={false}>
              {t.cal.next} →
            </Link>
          </p>
        ) : (
          <ul>
            {starting.map((x) => {
              const d = new Date(`${x.startDate}T00:00:00Z`);
              return (
                <li key={x.id} style={{ "--h": hue(x.id) } as React.CSSProperties}>
                  <span className="cal-date">
                    <strong>{d.getUTCDate()}</strong>
                    <small>{t.cal.weekdays[(d.getUTCDay() + 6) % 7]}</small>
                  </span>
                  <div className="cal-info">
                    <Link href={`/tours/${x.id}`}>
                      <strong>{x.title}</strong>
                    </Link>
                    <small>
                      {t.kind[x.kind]} · {x.country} · {t.tour.daysNights(x.days)} · {x.startDate.slice(5).replace("-", ".")}–{x.endDate.slice(5).replace("-", ".")}
                    </small>
                  </div>
                  <div className="cal-buy">
                    <span className="mono">{fmt(x.price)}</span>
                    <small className={x.seats <= 3 ? "low" : undefined}>{x.seats > 0 ? t.cal.seats(x.seats) : t.cal.full}</small>
                  </div>
                  {x.seats > 0 && x.endDate >= today ? (
                    <BookButton tour={x} className="btn sm">
                      {t.card.book}
                    </BookButton>
                  ) : (
                    <Link href={`/tours/${x.id}`} className="btn ghost sm">
                      {t.cal.view}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
