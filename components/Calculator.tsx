"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBooking } from "@/app/actions";
import { ADDON_UNIT, ADDONS, addonAvailable, calculate, convert, CURRENCIES, fmtCurrency, type Addon, type CalcSettings, type Currency } from "@/lib/calc";
import { dateRange, dotDate, fmt, type Kind } from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { useI18n } from "./LocaleProvider";

export type CalcTourOption = { id: number; title: string; price: number; days: number; kind: Kind; seats: number; startDate: string; endDate: string };

function Stepper({ id, label, value, min, max, onChange, hint }: { id: string; label: string; value: number; min: number; max: number; onChange: (v: number) => void; hint?: string }) {
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
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Calculator({ tours, settings, initialTourId }: { tours: CalcTourOption[]; settings: CalcSettings; initialTourId?: number }) {
  const { locale, t } = useI18n();
  const c = t.calc;
  const [tourId, setTourId] = useState(tours.some((x) => x.id === initialTourId) ? initialTourId! : tours[0]?.id);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [singleRooms, setSingleRooms] = useState(0);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");

  const tour = tours.find((x) => x.id === tourId);
  const result = useMemo(() => (tour ? calculate(tour, { adults, children, singleRooms, addons }, settings) : null), [tour, adults, children, singleRooms, addons, settings]);

  if (!tour || !result) return <p className="empty">{t.list.emptyTitle}</p>;
  const nights = tour.days - 1;

  function pickTour(id: number) {
    setTourId(id);
    // Keep the URL shareable without adding history entries
    const url = new URL(window.location.href);
    url.searchParams.set("tour", String(id));
    window.history.replaceState(null, "", url);
  }

  const lineLabel = (key: string) => (key in c.line ? c.line[key as keyof typeof c.line] : c.addon[key as Addon][0]);
  const unitLabel = (key: string) => {
    if (key === "single") return `${fmt(settings.singlePerNight)} × ${nights} ${c.perNight}`;
    return fmt(result.lines.find((l) => l.key === key)!.unit);
  };

  return (
    <div className="calc">
      <div className="calc-form">
        <section className="calc-card">
          <h2>{c.tour}</h2>
          <div className="field">
            <label htmlFor="calc-tour" className="sr-only">
              {c.tour}
            </label>
            <select id="calc-tour" value={tour.id} onChange={(e) => pickTour(Number(e.target.value))}>
              {(["abroad", "local", "day"] as Kind[]).map((k) => (
                <optgroup key={k} label={t.kind[k]}>
                  {tours
                    .filter((x) => x.kind === k)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.title} · {fmt(x.price)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <p className="calc-meta">
            {dateRange(tour)} · {t.tour.daysNights(tour.days)} ·{" "}
            <Link href={`/tours/${tour.id}`} className="more">
              {t.hero.cta} →
            </Link>
          </p>
        </section>

        <section className="calc-card">
          <h2>{c.travelers}</h2>
          <div className="row">
            <Stepper id="adults" label={c.adults} value={adults} min={1} max={10} onChange={(v) => { setAdults(v); setSingleRooms((s) => Math.min(s, v)); }} />
            <Stepper id="children" label={c.children} value={children} min={0} max={10} onChange={setChildren} hint={c.childNote(settings.childPercent)} />
          </div>
          {result.overSeats && (
            <p className="err" role="alert">
              {c.overSeats(tour.seats)}
            </p>
          )}
        </section>

        <section className="calc-card">
          <h2>{c.rooms}</h2>
          {nights > 0 ? (
            <Stepper id="single" label={c.singleRooms} value={singleRooms} min={0} max={adults} onChange={setSingleRooms} hint={c.singleNote(fmt(settings.singlePerNight))} />
          ) : (
            <p className="hint">{c.noRooms}</p>
          )}
        </section>

        <section className="calc-card">
          <h2>{c.extras}</h2>
          <div className="calc-addons">
            {ADDONS.map((a) => {
              const available = addonAvailable(a, tour.kind);
              const on = addons.includes(a) && available;
              return (
                <label key={a} className={`calc-addon${on ? " on" : ""}${available ? "" : " off"}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!available}
                    onChange={(e) => setAddons((cur) => (e.target.checked ? [...cur, a] : cur.filter((x) => x !== a)))}
                  />
                  <span className="calc-addon-name">{c.addon[a][0]}</span>
                  <span className="calc-addon-price">
                    {fmt(settings.addons[a])} <small>/ {c.addon[a][1]}</small>
                  </span>
                  {!available && <small className="hint">{c.simAbroadOnly}</small>}
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="calc-summary" aria-label={c.summary}>
        <h2>{c.summary}</h2>
        <ul className="calc-lines">
          {result.lines.map((l) => (
            <li key={l.key}>
              <span>
                {lineLabel(l.key)}
                <small>
                  {l.qty} × {unitLabel(l.key)}
                  {ADDON_UNIT[l.key as Addon] === "personDay" && ` (${result.travelers} × ${tour.days})`}
                </small>
              </span>
              <strong>{fmt(l.amount)}</strong>
            </li>
          ))}
        </ul>
        <div className="calc-total">
          <span>{c.total}</span>
          <strong>{fmt(result.total)}</strong>
        </div>
        <div className="calc-pp">
          <span>{c.perPerson}</span>
          <span>{fmt(result.perPerson)}</span>
        </div>
        <div className="calc-fx">
          <label htmlFor="calc-cur">{c.inCurrency}</label>
          <select id="calc-cur" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            {CURRENCIES.map((cur) => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
          <strong>≈ {fmtCurrency(convert(result.total, currency, settings), currency)}</strong>
        </div>
        <p className="fine">{c.rateNote(dotDate(settings.ratesDate))}</p>

        <ContactForm
          key={`${tour.id}`}
          idPrefix="cb"
          title={c.bookTitle}
          disclaimer={c.disclaimer}
          disabled={result.overSeats}
          onSubmit={({ lastName, firstName, phone, dial, email }) =>
            createBooking({ type: "tour", tourId: tour.id, lastName, firstName, phone, dial, email, pax: result.travelers, locale, calc: { adults, children, singleRooms, addons } })
          }
        />
      </aside>
    </div>
  );
}

export function CurrencyConverter({ settings }: { settings: CalcSettings }) {
  const { t } = useI18n();
  const c = t.calc;
  const [mnt, setMnt] = useState("1000000");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [fromMnt, setFromMnt] = useState(true);
  const amount = Number(mnt.replace(/[^\d.]/g, "")) || 0;
  const result = fromMnt ? convert(amount, currency, settings) : amount * settings.rates[currency];

  return (
    <section className="calc-card converter" aria-labelledby="conv-h">
      <div>
        <h2 id="conv-h">{c.converter}</h2>
        <p className="hint">{c.converterLead}</p>
      </div>
      <div className="conv-row">
        <div className="field">
          <label htmlFor="conv-amt">
            {c.amount} ({fromMnt ? "MNT" : currency})
          </label>
          <input id="conv-amt" inputMode="decimal" value={mnt} onChange={(e) => setMnt(e.target.value)} />
        </div>
        <button type="button" className="icon-btn conv-swap" onClick={() => setFromMnt((f) => !f)} aria-label={c.swap} title={c.swap}>
          ⇄
        </button>
        <div className="field">
          <label htmlFor="conv-cur">{c.currency}</label>
          <select id="conv-cur" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            {CURRENCIES.map((cur) => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="conv-result" aria-live="polite">
        {fromMnt ? `${fmt(amount)} ≈ ${fmtCurrency(result, currency)}` : `${fmtCurrency(amount, currency)} ≈ ${fmt(Math.round(result))}`}
      </p>
      <ul className="conv-rates">
        {CURRENCIES.map((cur) => (
          <li key={cur}>
            <span>1 {cur}</span>
            <span>{fmt(settings.rates[cur])}</span>
          </li>
        ))}
      </ul>
      <p className="fine">{c.rateNote(dotDate(settings.ratesDate))}</p>
    </section>
  );
}
