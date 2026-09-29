"use client";

import { useState } from "react";
import { fromEditDays, toEditDays, type EditDay, type EditRow } from "@/lib/schedule";

const emptyRow = (): EditRow => ({ start: "", end: "", text: "", textEn: "" });

// Day-by-day timetable: each row has its own start/end time and activity (MN + EN).
// Posts as the plain-text "schedule" / "scheduleEn" fields the site already reads.
export function ScheduleEditor({ initialMn, initialEn, defaultDays }: { initialMn: string; initialEn: string; defaultDays: number }) {
  const [days, setDays] = useState<EditDay[]>(() => toEditDays(initialMn, initialEn, defaultDays));
  const { mn, en } = fromEditDays(days);

  const setDay = (i: number, patch: Partial<EditDay>) => setDays((ds) => ds.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  const setRow = (i: number, j: number, patch: Partial<EditRow>) =>
    setDays((ds) => ds.map((d, k) => (k === i ? { ...d, rows: d.rows.map((r, m) => (m === j ? { ...r, ...patch } : r)) } : d)));
  const moveRow = (i: number, j: number, dir: -1 | 1) =>
    setDays((ds) =>
      ds.map((d, k) => {
        if (k !== i || j + dir < 0 || j + dir >= d.rows.length) return d;
        const rows = [...d.rows];
        [rows[j], rows[j + dir]] = [rows[j + dir], rows[j]];
        return { ...d, rows };
      }),
    );
  // Keeps each day in time order; untimed rows stay where they are relative to each other at the end
  const sortDay = (i: number) =>
    setDay(i, { rows: [...days[i].rows].sort((a, b) => (a.start && b.start ? a.start.localeCompare(b.start) : a.start ? -1 : b.start ? 1 : 0)) });

  return (
    <div className="sch">
      <input type="hidden" name="schedule" value={mn} />
      <input type="hidden" name="scheduleEn" value={en} />

      {days.map((d, i) => (
        <fieldset key={i} className="sch-day">
          <legend>{i + 1}-р өдөр</legend>
          <div className="sch-day-head">
            <input aria-label={`${i + 1}-р өдрийн гарчиг`} placeholder="Гарчиг, жишээ: Улаанбаатар – Манжуур" value={d.title} onChange={(e) => setDay(i, { title: e.target.value })} />
            <input aria-label={`Day ${i + 1} title (English)`} lang="en" placeholder="Title (English)" value={d.titleEn} onChange={(e) => setDay(i, { titleEn: e.target.value })} />
            <div className="sch-day-tools">
              <button type="button" className="a-btn sm" onClick={() => sortDay(i)} title="Цагаар нь эрэмбэлэх">
                ⇅ Цагаар
              </button>
              <button
                type="button"
                className="a-btn sm danger"
                onClick={() => confirm(`${i + 1}-р өдрийг устгах уу?`) && setDays((ds) => ds.filter((_, k) => k !== i))}
                disabled={days.length === 1}
              >
                Өдөр устгах
              </button>
            </div>
          </div>

          <table className="sch-table">
            <thead>
              <tr>
                <th scope="col">Эхлэх</th>
                <th scope="col">Дуусах</th>
                <th scope="col">Үйл ажиллагаа</th>
                <th scope="col" lang="en">
                  Activity (EN)
                </th>
                <th scope="col">
                  <span className="sr-only">Үйлдэл</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((r, j) => (
                <tr key={j}>
                  <td>
                    <input type="time" aria-label="Эхлэх цаг" value={r.start} onChange={(e) => setRow(i, j, { start: e.target.value, end: e.target.value ? r.end : "" })} />
                  </td>
                  <td>
                    <input type="time" aria-label="Дуусах цаг" value={r.end} disabled={!r.start} onChange={(e) => setRow(i, j, { end: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label="Үйл ажиллагаа" placeholder="Жишээ: Нисэх буудалд цуглах" value={r.text} onChange={(e) => setRow(i, j, { text: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label="Activity (English)" lang="en" placeholder="Meet at the airport" value={r.textEn} onChange={(e) => setRow(i, j, { textEn: e.target.value })} />
                  </td>
                  <td className="sch-row-tools">
                    <button type="button" onClick={() => moveRow(i, j, -1)} disabled={j === 0} aria-label="Дээш">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveRow(i, j, 1)} disabled={j === d.rows.length - 1} aria-label="Доош">
                      ↓
                    </button>
                    <button type="button" className="del" onClick={() => setDay(i, { rows: d.rows.filter((_, m) => m !== j) })} aria-label="Мөр устгах">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="a-btn sm" onClick={() => setDay(i, { rows: [...d.rows, emptyRow()] })}>
            + Мөр нэмэх
          </button>
        </fieldset>
      ))}

      <div className="sch-foot">
        <button type="button" className="a-btn" onClick={() => setDays((ds) => [...ds, { title: "", titleEn: "", rows: [emptyRow()] }])}>
          + Өдөр нэмэх
        </button>
        <span className="a-hint">Цаггүй мөр (жишээ: “Орой чөлөөт цаг”) бол эхлэх цагийг хоосон үлдээнэ. Үйл ажиллагаа хоосон мөр хадгалагдахгүй.</span>
      </div>
    </div>
  );
}
