"use client";

import { useState, useTransition } from "react";
import type { BookingResult } from "@/app/actions";
import { isEmail } from "@/lib/data";
import { DEFAULT_DIAL, formatPhone, isValidPhone } from "@/lib/phone";
import { CheckIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";
import { NameFields } from "./NameFields";
import { PhoneField } from "./PhoneField";

export type ContactValues = { lastName: string; firstName: string; phone: string; dial: string; email: string };

// Name / phone / email block with its own submit, success state and error handling.
// Used by the calculator, hotel and trip-planner pages; the caller decides what gets booked.
export function ContactForm({
  idPrefix,
  title,
  disclaimer,
  disabled = false,
  check,
  onSubmit,
}: {
  idPrefix: string;
  title: string;
  disclaimer: string;
  disabled?: boolean;
  // Extra validation owned by the page (e.g. "pick a province"); return a message to block submit
  check?: () => string | null;
  onSubmit: (c: ContactValues) => Promise<BookingResult>;
}) {
  const { t } = useI18n();
  const b = t.booking;
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [iso, setIso] = useState(DEFAULT_DIAL.iso);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const phoneOk = isValidPhone(iso, phone);
  const nameOk = !!lastName.trim() && !!firstName.trim();
  const phoneErr = touched && !phoneOk ? b.phoneError(iso === "MN") : null;
  const emailErr = touched && !isEmail(email.trim()) ? b.emailError : null;

  if (code) {
    return (
      <div className="calc-done" role="status">
        <span className="ok-icon">
          <CheckIcon width={24} height={24} />
        </span>
        <strong>{b.doneTitle}</strong>
        <p>
          {b.doneText(firstName.trim())} <strong>{formatPhone(iso, phone)}</strong> {b.doneText2}
        </p>
        <span className="code">{code}</span>
      </div>
    );
  }

  return (
    <form
      className="calc-book"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        const pageErr = check?.() ?? null;
        setErr(pageErr);
        if (pageErr || !nameOk || !phoneOk || !isEmail(email.trim()) || disabled) return;
        start(async () => {
          try {
            const res = await onSubmit({ lastName, firstName, phone, dial: iso, email });
            if (res.ok) setCode(res.code);
            else setErr(res.error);
          } catch {
            setErr(b.networkError);
          }
        });
      }}
    >
      <h3>{title}</h3>
      <NameFields idPrefix={idPrefix} lastName={lastName} firstName={firstName} onLastName={setLastName} onFirstName={setFirstName} touched={touched} />
      <PhoneField id={`${idPrefix}-phone`} iso={iso} onIso={setIso} value={phone} onChange={setPhone} error={phoneErr} />
      <div className="field">
        <label htmlFor={`${idPrefix}-email`}>{b.email}</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={b.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailErr}
        />
        {emailErr && <span className="err">{emailErr}</span>}
      </div>
      {err && (
        <p className="err" role="alert">
          {err}
        </p>
      )}
      <button type="submit" className="btn full" disabled={pending || disabled}>
        {pending ? b.sending : b.submit}
      </button>
      <p className="fine">{disclaimer}</p>
    </form>
  );
}
