"use client";

import { DEFAULT_DIAL, DIAL_CODES, dialByIso } from "@/lib/phone";
import { useI18n } from "./LocaleProvider";

// Country code picker + number. The native <select> sits invisibly over a compact
// "🇲🇳 +976" label, so it stays keyboard/screen-reader friendly while the closed state stays small.
export function PhoneField({
  id,
  iso,
  onIso,
  value,
  onChange,
  error,
}: {
  id: string;
  iso: string;
  onIso: (iso: string) => void;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}) {
  const { locale, t } = useI18n();
  const dial = dialByIso(iso) ?? DEFAULT_DIAL;
  return (
    <div className="field">
      <label htmlFor={id}>{t.booking.phone}</label>
      <div className={`phone-group${error ? " invalid" : ""}`}>
        <span className="phone-dial">
          <span aria-hidden="true">
            {dial.flag} {dial.code}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
          <select value={dial.iso} onChange={(e) => onIso(e.target.value)} aria-label={t.booking.countryCode}>
            {DIAL_CODES.map((d) => (
              <option key={d.iso} value={d.iso}>
                {d.flag} {locale === "en" ? d.en : d.mn} ({d.code})
              </option>
            ))}
          </select>
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={dial.example}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
      </div>
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}
