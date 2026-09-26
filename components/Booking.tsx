"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { createBooking } from "@/app/actions";
import { dateRange, fmt, isEmail, VOUCHER_AMOUNTS, VOUCHER_PRICE, type Tour } from "@/lib/data";
import { CheckIcon, XIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";

export type BookableTour = Pick<Tour, "id" | "title" | "startDate" | "endDate" | "seats" | "price">;

type Target = { type: "tour"; tour: BookableTour } | { type: "voucher" };

const BookingContext = createContext<(t: Target) => void>(() => {});

export function useBooking() {
  return useContext(BookingContext);
}

export function BookButton({ tour, children, className = "btn" }: { tour: BookableTour; children: ReactNode; className?: string }) {
  const open = useBooking();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        open({ type: "tour", tour: { id: tour.id, title: tour.title, startDate: tour.startDate, endDate: tour.endDate, seats: tour.seats, price: tour.price } });
      }}
    >
      {children}
    </button>
  );
}

export function VoucherButton({ children }: { children: ReactNode }) {
  const open = useBooking();
  return (
    <button type="button" className="btn" onClick={() => open({ type: "voucher" })}>
      {children}
    </button>
  );
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<Target | null>(null);
  // Bumped on every open so the form remounts with fresh state
  const [session, setSession] = useState(0);

  const open = useCallback((t: Target) => {
    setTarget(t);
    setSession((s) => s + 1);
  }, []);

  useEffect(() => {
    if (target && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [target, session]);

  const close = () => dialog.current?.close();

  return (
    <BookingContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="dlg"
        aria-labelledby="dlg-title"
        onClose={() => setTarget(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {target && <BookingForm key={session} target={target} onClose={close} />}
      </dialog>
    </BookingContext.Provider>
  );
}

function BookingForm({ target, onClose }: { target: Target; onClose: () => void }) {
  const isVoucher = target.type === "voucher";
  const { locale, t } = useI18n();
  const b = t.booking;
  const maxPax = isVoucher ? 10 : Math.max(1, target.tour.seats);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pax, setPax] = useState(Math.min(2, maxPax));
  const [amount, setAmount] = useState(VOUCHER_PRICE);
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const digits = phone.replace(/\D/g, "");
  const nameErr = touched && !name.trim() ? b.nameError : null;
  const phoneErr = touched && digits.length !== 8 ? b.phoneError : null;
  const emailErr = touched && !isEmail(email.trim()) ? b.emailError : null;
  const unit = isVoucher ? amount : target.tour.price;
  const total = unit * pax;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || digits.length !== 8 || !isEmail(email.trim())) return;
    setServerErr(null);
    startTransition(async () => {
      try {
        const res = await createBooking(
          target.type === "voucher" ? { type: "voucher", amount, name, phone, email, pax, locale } : { type: "tour", tourId: target.tour.id, name, phone, email, pax, locale },
        );
        if (res.ok) setCode(res.code);
        else setServerErr(res.error);
      } catch {
        setServerErr(b.networkError);
      }
    });
  }

  if (code) {
    return (
      <div className="dlg-body ok">
        <span className="ok-icon">
          <CheckIcon width={28} height={28} />
        </span>
        <h3 id="dlg-title">{b.doneTitle}</h3>
        <p>
          {b.doneText(name.trim())} <strong>{phone}</strong> {b.doneText2}
        </p>
        <div className="sum">
          <span>{b.code}</span>
          <button
            type="button"
            className="code"
            onClick={() => {
              navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {});
            }}
          >
            {code} · {copied ? b.copied : b.copy}
          </button>
        </div>
        <button type="button" className="btn" onClick={onClose} autoFocus>
          {b.close}
        </button>
      </div>
    );
  }

  return (
    <form className="dlg-body" onSubmit={submit} noValidate>
      <div className="dlg-head">
        <h3 id="dlg-title">{isVoucher ? b.voucherTitle : b.tourTitle}</h3>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={b.close}>
          <XIcon />
        </button>
      </div>

      {isVoucher ? (
        <fieldset className="field">
          <legend>{b.amount}</legend>
          <div className="chips">
            {VOUCHER_AMOUNTS.map((a) => (
              <button type="button" key={a} className="chip" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                {fmt(a)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="sum">
          <strong>{target.tour.title}</strong>
          <span>{dateRange(target.tour)}</span>
        </div>
      )}

      <div className="field">
        <label htmlFor="b-name">{b.name}</label>
        <input
          id="b-name"
          autoComplete="name"
          placeholder={b.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!nameErr}
          aria-describedby={nameErr ? "b-name-err" : undefined}
          autoFocus
        />
        {nameErr && (
          <span className="err" id="b-name-err">
            {nameErr}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="b-email">{b.email}</label>
        <input
          id="b-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={b.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailErr}
          aria-describedby={emailErr ? "b-email-err" : undefined}
        />
        {emailErr && (
          <span className="err" id="b-email-err">
            {emailErr}
          </span>
        )}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="b-phone">{b.phone}</label>
          <input
            id="b-phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="9911 2233"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!phoneErr}
            aria-describedby={phoneErr ? "b-phone-err" : undefined}
          />
          {phoneErr && (
            <span className="err" id="b-phone-err">
              {phoneErr}
            </span>
          )}
        </div>
        <div className="field">
          <span className="label" id="b-pax-label">
            {isVoucher ? b.quantity : b.people}
          </span>
          <div className="stepper" role="group" aria-labelledby="b-pax-label">
            <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} disabled={pax <= 1} aria-label={b.minus}>
              −
            </button>
            <output aria-live="polite">{pax}</output>
            <button type="button" onClick={() => setPax((p) => Math.min(maxPax, p + 1))} disabled={pax >= maxPax} aria-label={b.plus}>
              +
            </button>
          </div>
          {!isVoucher && pax >= maxPax && <span className="hint">{b.seatsLeft(maxPax)}</span>}
        </div>
      </div>

      <div className="sum total">
        <span>
          {fmt(unit)} × {pax}
        </span>
        <strong>{fmt(total)}</strong>
      </div>

      {serverErr && (
        <p className="err" role="alert">
          {serverErr}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onClose}>
          {b.cancel}
        </button>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? b.sending : b.submit}
        </button>
      </div>
      <p className="fine">{b.noPayment}</p>
    </form>
  );
}
