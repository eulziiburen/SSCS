"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { convert, CURRENCIES, fmtCurrency, type CalcSettings, type Currency } from "@/lib/calc";
import { dotDate } from "@/lib/data";
import { useI18n } from "./LocaleProvider";

type Rates = Pick<CalcSettings, "rates" | "ratesDate">;

// Admin-set exchange rates, provided once by the site layout
const RatesContext = createContext<Rates | null>(null);

export function RatesProvider({ rates, children }: { rates: Rates; children: ReactNode }) {
  return <RatesContext.Provider value={rates}>{children}</RatesContext.Provider>;
}

const STORE_KEY = "sscs:currency";

// Per-viewer convenience only; storage can be missing or blocked
function readStored(): Currency | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return (CURRENCIES as readonly string[]).includes(v ?? "") ? (v as Currency) : null;
  } catch {
    return null;
  }
}

// "≈ $626" under a ₮ total, with the currency picked by the visitor
export function CurrencyApprox({ mnt, id }: { mnt: number; id: string }) {
  const { t } = useI18n();
  const rates = useContext(RatesContext);
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const stored = readStored();
    if (stored) setCurrency(stored);
  }, []);

  const pick = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem(STORE_KEY, c);
    } catch {
      // ignore
    }
  };

  if (!rates) return null;
  return (
    <div className="fx">
      <label htmlFor={id} className="sr-only">
        {t.calc.currency}
      </label>
      <span className="fx-val" aria-live="polite">
        ≈ {fmtCurrency(convert(mnt, currency, rates), currency)}
      </span>
      <select id={id} value={currency} onChange={(e) => pick(e.target.value as Currency)}>
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <span className="fx-note">{t.calc.rateNote(dotDate(rates.ratesDate))}</span>
    </div>
  );
}
