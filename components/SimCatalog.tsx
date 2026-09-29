"use client";

import { useMemo, useRef, useState } from "react";
import { createSimOrder } from "@/app/actions";
import { countryName } from "@/lib/countries";
import { fmt } from "@/lib/data";
import type { SimPlan } from "@/lib/sims";
import { ContactForm } from "./ContactForm";
import { CurrencyApprox } from "./CurrencyApprox";
import { XIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";

// A stable colour per country code, so the same country always gets the same tile
function hue(code: string) {
  return ((code.charCodeAt(0) - 65) * 37 + (code.charCodeAt(1) - 65) * 11) % 360;
}

function CodeTile({ code, small = false }: { code: string; small?: boolean }) {
  return (
    <span className={`sim-code${small ? " sm" : ""}`} style={{ "--h": hue(code) } as React.CSSProperties}>
      {code}
    </span>
  );
}

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>
);
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export function SimCatalog({ plans, today }: { plans: SimPlan[]; today: string }) {
  const { locale, t } = useI18n();
  const s = t.sim;
  const [country, setCountry] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<SimPlan | null>(null);

  // Countries in first-seen order, each with how many plans cover it
  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plans) for (const c of p.countries) counts.set(c, (counts.get(c) ?? 0) + 1);
    return [...counts];
  }, [plans]);
  const shown = country ? plans.filter((p) => p.countries.includes(country)) : plans;

  if (!plans.length) return <p className="sim-empty">{s.empty}</p>;

  return (
    <>
      <div className="sim-filter" role="group" aria-label={s.filter}>
        <button type="button" className="sim-chip" aria-pressed={!country} onClick={() => setCountry(null)}>
          {s.all} <span className="n">{plans.length}</span>
        </button>
        {countries.map(([code, n]) => (
          <button key={code} type="button" className="sim-chip" aria-pressed={country === code} onClick={() => setCountry(code)}>
            <CodeTile code={code} small />
            {countryName(code, locale)} <span className="n">{n}</span>
          </button>
        ))}
      </div>

      <ul className="sim-grid" aria-live="polite">
        {shown.map((p) => {
          const title = (locale === "en" && p.titleEn) || p.title;
          return (
            <li key={p.id} className="sim">
              <div className="sim-in">
                <div className="sim-top">
                  <span className="sim-codes" aria-hidden="true">
                    {p.countries.slice(0, 3).map((c) => (
                      <CodeTile key={c} code={c} />
                    ))}
                    {p.countries.length > 3 && <span className="sim-code more">+{p.countries.length - 3}</span>}
                  </span>
                  <span className={`sim-kind k-${p.kind}`}>{s.kind[p.kind]}</span>
                </div>
                <h3>{title}</h3>
                <p className="sim-where">{p.countries.map((c) => countryName(c, locale)).join(" · ")}</p>
                <div className="sim-spec">
                  <div>
                    <strong>{p.kind === "unlimited" ? "∞" : p.dataAmount}</strong>
                    <span>{p.kind === "unlimited" ? `${s.unlimited} ${s.unlimitedSub}` : p.kind === "daily" ? s.dataDaily : s.dataTotal}</span>
                  </div>
                  <div>
                    <strong>{p.days}</strong>
                    <span>{s.daysSub}</span>
                  </div>
                </div>
                <p className={`sim-act a-${p.activation}`}>
                  {p.activation === "anytime" ? <BoltIcon /> : <CalIcon />}
                  {p.activation === "anytime" ? s.anytime : s.fromDate}
                </p>
                {p.activateWithin ? <p className="sim-within">{s.within(p.activateWithin)}</p> : null}
                <div className="sim-foot">
                  <span className="sim-price">{fmt(p.price)}</span>
                  <button type="button" className="btn sm" onClick={() => setOrdering(p)}>
                    {s.order}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {ordering && <SimOrderDialog key={ordering.id} plan={ordering} today={today} onClose={() => setOrdering(null)} />}
    </>
  );
}

function SimOrderDialog({ plan, today, onClose }: { plan: SimPlan; today: string; onClose: () => void }) {
  const { locale, t } = useI18n();
  const s = t.sim;
  const ref = useRef<HTMLDialogElement>(null);
  const [qty, setQty] = useState(1);
  const [start, setStart] = useState("");
  const title = (locale === "en" && plan.titleEn) || plan.title;

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) {
          el.showModal();
          requestAnimationFrame(() => el.querySelector<HTMLElement>("#so-last")?.focus());
        }
      }}
      className="dlg"
      aria-labelledby="sim-dlg-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
    >
      <div className="dlg-body">
        <div className="dlg-head">
          <h3 id="sim-dlg-title">{s.orderTitle}</h3>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label={s.close}>
            <XIcon />
          </button>
        </div>
        <div className="sum">
          <strong>{title}</strong>
          <span>
            {plan.kind === "unlimited" ? s.unlimited : `${plan.dataAmount} ${plan.kind === "daily" ? s.dataDaily : s.dataTotal}`} · {plan.days} {s.daysSub}
          </span>
        </div>
        <div className="row">
          <div className="field">
            <span className="label" id="sim-qty-l">
              {s.qty}
            </span>
            <div className="stepper" role="group" aria-labelledby="sim-qty-l">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.booking.minus}>
                −
              </button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20} aria-label={t.booking.plus}>
                +
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="sim-start">{s.start}</label>
            <input id="sim-start" type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
        </div>
        <div className="sum total">
          <span>
            {fmt(plan.price)} × {qty}
          </span>
          <strong>{fmt(plan.price * qty)}</strong>
          <CurrencyApprox id="sim-fx" mnt={plan.price * qty} />
        </div>
        <ContactForm idPrefix="so" title={t.booking.submit} disclaimer={s.disclaimer} onSubmit={(c) => createSimOrder({ ...c, locale, planId: plan.id, qty, startDate: start })} />
      </div>
    </dialog>
  );
}
