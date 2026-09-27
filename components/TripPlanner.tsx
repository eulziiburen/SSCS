"use client";

import { useState } from "react";
import { createCustomTrip } from "@/app/actions";
import { fmt } from "@/lib/data";
import { HOTEL_CATEGORIES, starsLabel, type Hotel, type RegionView } from "@/lib/places";
import { ContactForm } from "./ContactForm";
import { useI18n } from "./LocaleProvider";
import { MongoliaMap } from "./MongoliaMap";

export type PlannerHotel = Pick<Hotel, "id" | "name" | "regionCode" | "city" | "stars" | "category" | "pricePerNight">;

const TRANSPORTS = ["car", "van", "bus", "own"] as const;

function Counter({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="field">
      <span className="label" id={`${id}-l`}>
        {label}
      </span>
      <div className="stepper" role="group" aria-labelledby={`${id}-l`}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={t.booking.minus}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={t.booking.plus}>
          +
        </button>
      </div>
    </div>
  );
}

export function TripPlanner({ regions, hotels, initialRegions, today }: { regions: RegionView[]; hotels: PlannerHotel[]; initialRegions: string[]; today: string }) {
  const { locale, t } = useI18n();
  const p = t.plan;
  const [picked, setPicked] = useState<string[]>(initialRegions.filter((c) => regions.some((r) => r.code === c)));
  const [sights, setSights] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(5);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [accommodation, setAccommodation] = useState("");
  const [hotelIds, setHotelIds] = useState<number[]>([]);
  const [transport, setTransport] = useState<(typeof TRANSPORTS)[number]>("car");
  const [guide, setGuide] = useState(false);
  const [notes, setNotes] = useState("");

  const names = Object.fromEntries(regions.map((r) => [r.code, r.name]));
  const chosen = picked.map((c) => regions.find((r) => r.code === c)!).filter(Boolean);
  const regionHotels = hotels.filter((h) => picked.includes(h.regionCode));

  function toggleRegion(code: string) {
    if (!picked.includes(code)) {
      setPicked([...picked, code]);
      return;
    }
    // Dropping a province also drops its sights and hotels
    setPicked(picked.filter((c) => c !== code));
    setSights((s) => s.filter((x) => !x.startsWith(`${code}:`)));
    setHotelIds((ids) => ids.filter((id) => hotels.find((h) => h.id === id)?.regionCode !== code));
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="planner">
      <div className="planner-steps">
        <section className="calc-card" aria-labelledby="st1">
          <div>
            <h2 id="st1">{p.step1}</h2>
            <p className="hint">{p.step1Hint}</p>
          </div>
          <MongoliaMap names={names} selected={picked} onSelect={toggleRegion} label={p.step1} />
          <div className="chips region-chips" role="list" aria-label={t.map.listLabel}>
            {regions.map((r) => (
              <button key={r.code} role="listitem" type="button" className="chip" aria-pressed={picked.includes(r.code)} onClick={() => toggleRegion(r.code)}>
                {r.name}
              </button>
            ))}
          </div>
        </section>

        <section className="calc-card" aria-labelledby="st2">
          <h2 id="st2">{p.step2}</h2>
          {chosen.length === 0 && <p className="hint">{p.step2Empty}</p>}
          {chosen.map((r) => (
            <fieldset key={r.code} className="sight-group">
              <legend>{r.name}</legend>
              <div className="calc-addons">
                {r.attractions.map((a, i) => {
                  const ref = `${r.code}:${i}`;
                  const on = sights.includes(ref);
                  return (
                    <label key={ref} className={`calc-addon${on ? " on" : ""}`}>
                      <input type="checkbox" checked={on} onChange={() => setSights((s) => toggle(s, ref))} />
                      <span className="calc-addon-name">{a}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>

        <section className="calc-card" aria-labelledby="st3">
          <h2 id="st3">{p.step3}</h2>
          <div className="row">
            <div className="field">
              <label htmlFor="pl-date">{p.startDate}</label>
              <input id="pl-date" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <Counter id="pl-days" label={p.days} value={days} min={1} max={30} onChange={setDays} />
          </div>
          <div className="row">
            <Counter id="pl-adults" label={t.calc.adults} value={adults} min={1} max={40} onChange={setAdults} />
            <Counter id="pl-children" label={t.calc.children} value={children} min={0} max={40} onChange={setChildren} />
          </div>
        </section>

        <section className="calc-card" aria-labelledby="st4">
          <h2 id="st4">{p.step4}</h2>
          <fieldset className="field">
            <legend>{p.accommodation}</legend>
            <div className="chips">
              <button type="button" className="chip" aria-pressed={accommodation === ""} onClick={() => setAccommodation("")}>
                {p.accAny}
              </button>
              {HOTEL_CATEGORIES.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={accommodation === c} onClick={() => setAccommodation(c)}>
                  {t.hotels.category_[c]}
                </button>
              ))}
            </div>
          </fieldset>

          {picked.length > 0 && (
            <fieldset className="field">
              <legend>{p.hotelsInRegions}</legend>
              {regionHotels.length ? (
                <div className="calc-addons">
                  {regionHotels.map((h) => {
                    const on = hotelIds.includes(h.id);
                    return (
                      <label key={h.id} className={`calc-addon${on ? " on" : ""}`}>
                        <input type="checkbox" checked={on} onChange={() => setHotelIds((ids) => toggle(ids, h.id))} />
                        <span className="calc-addon-name">
                          {h.name} {h.stars > 0 && <span className="stars">{starsLabel(h.stars)}</span>}
                        </span>
                        <span className="calc-addon-price">
                          {fmt(h.pricePerNight)} <small>/ {t.hotels.perNight}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="hint">{p.noHotels}</p>
              )}
            </fieldset>
          )}

          <fieldset className="field">
            <legend>{p.transport}</legend>
            <div className="chips">
              {TRANSPORTS.map((x) => (
                <button key={x} type="button" className="chip" aria-pressed={transport === x} onClick={() => setTransport(x)}>
                  {p.transport_[x]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="a-check">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} /> {p.guide}
          </label>

          <div className="field">
            <label htmlFor="pl-notes">{p.notes}</label>
            <textarea id="pl-notes" rows={3} maxLength={1000} placeholder={p.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </section>
      </div>

      <aside className="calc-summary" aria-label={p.summary}>
        <h2>{p.summary}</h2>
        <ul className="calc-lines">
          <li>
            <span>{p.summaryRegions}</span>
            <strong className="plain">{chosen.length ? chosen.map((r) => r.name).join(", ") : "—"}</strong>
          </li>
          <li>
            <span>{p.step2.replace(/^\d+\.\s*/, "")}</span>
            <strong className="plain">{p.summaryPlaces(sights.length)}</strong>
          </li>
          <li>
            <span>{p.startDate}</span>
            <strong className="plain">{startDate ? `${startDate.replaceAll("-", ".")} · ${p.summaryDates(days)}` : p.summaryDates(days)}</strong>
          </li>
          <li>
            <span>{t.calc.travelers}</span>
            <strong className="plain">
              {adults}
              {children ? ` + ${children}` : ""}
            </strong>
          </li>
        </ul>
        <p className="fine">{p.submitHint}</p>
        <ContactForm
          idPrefix="pl"
          title={p.submitTitle}
          disclaimer={t.tour.noPayment}
          check={() => (!picked.length ? p.needRegion : !startDate ? p.needDate : null)}
          onSubmit={(c) =>
            createCustomTrip({ ...c, locale, regions: picked, sights, startDate, days, adults, children, accommodation, hotelIds, transport, guide, notes })
          }
        />
      </aside>
    </div>
  );
}
