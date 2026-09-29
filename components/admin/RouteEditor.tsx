"use client";

import { useState } from "react";

type Stop = { mn: string; en: string };

const split = (v: string) => v.split(/\r?\n/).map((s) => s.trim());

// One row per stop (MN + EN side by side). Posts the newline-separated "route" / "routeEn" fields saveTour reads.
export function RouteEditor({ initialMn, initialEn }: { initialMn: string; initialEn: string }) {
  const [stops, setStops] = useState<Stop[]>(() => {
    const mn = split(initialMn);
    const en = split(initialEn);
    const rows = mn.map((m, i) => ({ mn: m, en: en[i] ?? "" }));
    while (rows.length < 2) rows.push({ mn: "", en: "" });
    return rows;
  });

  const kept = stops.filter((s) => s.mn.trim());
  const hasEn = kept.some((s) => s.en.trim());
  const route = kept.map((s) => s.mn.trim()).join("\n");
  // English falls back to the Mongolian name per stop, so both lists always line up
  const routeEn = hasEn ? kept.map((s) => s.en.trim() || s.mn.trim()).join("\n") : "";

  const set = (i: number, patch: Partial<Stop>) => setStops((ss) => ss.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) =>
    setStops((ss) => {
      if (i + dir < 0 || i + dir >= ss.length) return ss;
      const next = [...ss];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  return (
    <div className="rte">
      <input type="hidden" name="route" value={route} />
      <input type="hidden" name="routeEn" value={routeEn} />
      <ol className="rte-list">
        {stops.map((s, i) => (
          <li key={i}>
            <span className="rte-dot" aria-hidden="true">
              {i + 1}
            </span>
            <input
              aria-label={`${i + 1}-р цэг`}
              placeholder={i === 0 ? "Хөдлөх газар, жишээ: Улаанбаатар" : i === stops.length - 1 ? "Буцаж ирэх газар" : "Зогсоол"}
              value={s.mn}
              onChange={(e) => set(i, { mn: e.target.value })}
              onKeyDown={(e) => {
                // Enter adds the next stop instead of submitting the whole tour form
                if (e.key !== "Enter") return;
                e.preventDefault();
                const list = e.currentTarget.closest("ol");
                setStops((ss) => [...ss.slice(0, i + 1), { mn: "", en: "" }, ...ss.slice(i + 1)]);
                requestAnimationFrame(() => list?.children[i + 1]?.querySelector("input")?.focus());
              }}
            />
            <input aria-label={`Stop ${i + 1} (English)`} lang="en" placeholder="English (заавал биш)" value={s.en} onChange={(e) => set(i, { en: e.target.value })} />
            <span className="rte-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Дээш">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === stops.length - 1} aria-label="Доош">
                ↓
              </button>
              <button type="button" className="del" onClick={() => setStops((ss) => ss.filter((_, k) => k !== i))} disabled={stops.length <= 2} aria-label="Цэг устгах">
                ×
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="rte-foot">
        <button type="button" className="a-btn sm" onClick={() => setStops((ss) => [...ss.slice(0, -1), { mn: "", en: "" }, ss[ss.length - 1]])}>
          + Зогсоол нэмэх
        </button>
        <span className="a-hint">Шинэ зогсоол буцаж ирэх цэгийн өмнө нэмэгдэнэ. Талбарт Enter дарвал дараагийн мөр үүснэ. Хамгийн багадаа 2 цэг.</span>
      </div>
    </div>
  );
}
