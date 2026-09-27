"use client";

import { useState } from "react";
import { createHotelBooking } from "@/app/actions";
import { fmt } from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { CurrencyApprox } from "./CurrencyApprox";
import { useI18n } from "./LocaleProvider";

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

export function HotelBooking({ hotelId, price, today }: { hotelId: number; price: number; today: string }) {
  const { locale, t } = useI18n();
  const h = t.hotels;
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const total = price * nights * rooms;

  return (
    <div className="hotel-book">
      <h2>{h.bookTitle}</h2>
      <div className="field">
        <label htmlFor="hb-date">{h.checkIn}</label>
        <input id="hb-date" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>
      <div className="row three">
        <Counter id="hb-nights" label={h.nights} value={nights} min={1} max={30} onChange={setNights} />
        <Counter id="hb-rooms" label={h.rooms} value={rooms} min={1} max={10} onChange={(v) => { setRooms(v); setGuests((g) => Math.max(g, v)); }} />
        <Counter id="hb-guests" label={h.guests} value={guests} min={rooms} max={rooms * 4} onChange={setGuests} />
      </div>
      <div className="sum total">
        <span>{h.total(nights, rooms)}</span>
        <strong>{fmt(total)}</strong>
        {total > 0 && <CurrencyApprox id="hb-fx" mnt={total} />}
      </div>
      <ContactForm
        idPrefix="hb"
        title={h.contactTitle}
        disclaimer={t.tour.noPayment}
        check={() => (checkIn ? null : h.needCheckIn)}
        onSubmit={(c) => createHotelBooking({ ...c, locale, hotelId, checkIn, nights, rooms, guests })}
      />
    </div>
  );
}
