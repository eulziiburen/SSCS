"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { dateRange, fmt, tourById, VOUCHER_PRICE, type Tour } from "@/lib/data";
import { CheckIcon, XIcon } from "./Icons";

type Target = { type: "tour"; tour: Tour } | { type: "voucher" };

const BookingContext = createContext<(t: Target) => void>(() => {});

export function useBooking() {
  return useContext(BookingContext);
}

export function BookButton({ tourId, children, className = "btn" }: { tourId: number; children: ReactNode; className?: string }) {
  const open = useBooking();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        const tour = tourById(tourId);
        if (tour) open({ type: "tour", tour });
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

const VOUCHER_AMOUNTS = [200000, VOUCHER_PRICE, 1000000];

function BookingForm({ target, onClose }: { target: Target; onClose: () => void }) {
  const isVoucher = target.type === "voucher";
  const maxPax = isVoucher ? 10 : Math.max(1, target.tour.seats);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pax, setPax] = useState(Math.min(2, maxPax));
  const [amount, setAmount] = useState(VOUCHER_PRICE);
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const nameErr = touched && !name.trim() ? "Овог, нэрээ оруулна уу." : null;
  const phoneErr = touched && digits.length !== 8 ? "8 оронтой утасны дугаар оруулна уу." : null;
  const unit = isVoucher ? amount : target.tour.price;
  const total = unit * pax;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || digits.length !== 8) return;
    setCode("ТА-" + Math.floor(100000 + Math.random() * 900000));
  }

  if (code) {
    return (
      <div className="dlg-body ok">
        <span className="ok-icon">
          <CheckIcon width={28} height={28} />
        </span>
        <h3 id="dlg-title">Хүсэлт бүртгэгдлээ</h3>
        <p>
          Баярлалаа, {name.trim()}! Манай менежер ажлын 1 өдрийн дотор <strong>{phone}</strong> дугаарт холбогдож төлбөрийн нөхцөлийг
          танилцуулна.
        </p>
        <div className="sum">
          <span>Захиалгын дугаар</span>
          <button
            type="button"
            className="code"
            onClick={() => {
              navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {});
            }}
          >
            {code} · {copied ? "хуулсан" : "хуулах"}
          </button>
        </div>
        <button type="button" className="btn" onClick={onClose} autoFocus>
          Хаах
        </button>
      </div>
    );
  }

  return (
    <form className="dlg-body" onSubmit={submit} noValidate>
      <div className="dlg-head">
        <h3 id="dlg-title">{isVoucher ? "Эрхийн бичиг захиалах" : "Аялал захиалах"}</h3>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Хаах">
          <XIcon />
        </button>
      </div>

      {isVoucher ? (
        <fieldset className="field">
          <legend>Дүн</legend>
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
        <label htmlFor="b-name">Овог, нэр</label>
        <input
          id="b-name"
          autoComplete="name"
          placeholder="Бат-Эрдэнэ"
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

      <div className="row">
        <div className="field">
          <label htmlFor="b-phone">Утас</label>
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
            {isVoucher ? "Тоо ширхэг" : "Хүний тоо"}
          </span>
          <div className="stepper" role="group" aria-labelledby="b-pax-label">
            <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} disabled={pax <= 1} aria-label="Хасах">
              −
            </button>
            <output aria-live="polite">{pax}</output>
            <button type="button" onClick={() => setPax((p) => Math.min(maxPax, p + 1))} disabled={pax >= maxPax} aria-label="Нэмэх">
              +
            </button>
          </div>
          {!isVoucher && pax >= maxPax && <span className="hint">Үлдэгдэл {maxPax} суудал</span>}
        </div>
      </div>

      <div className="sum total">
        <span>
          {fmt(unit)} × {pax}
        </span>
        <strong>{fmt(total)}</strong>
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onClose}>
          Болих
        </button>
        <button type="submit" className="btn">
          Хүсэлт илгээх
        </button>
      </div>
      <p className="fine">Одоо төлбөр төлөхгүй. Менежер холбогдож баталгаажуулна.</p>
    </form>
  );
}
