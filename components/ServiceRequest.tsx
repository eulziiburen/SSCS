"use client";

import { useState } from "react";
import { createServiceRequest } from "@/app/actions";
import { SERVICE_KEYS, type ServiceKey } from "@/lib/services";
import { ContactForm } from "./ContactForm";
import { useI18n } from "./LocaleProvider";
import { ServiceIcon } from "./ServiceIcon";

export function ServiceRequest({ initial, names, today }: { initial: ServiceKey; names: Record<ServiceKey, string>; today: string }) {
  const { locale, t } = useI18n();
  const s = t.svc;
  const [service, setService] = useState<ServiceKey>(initial);
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [note, setNote] = useState("");

  return (
    <div className="svc-request">
      <h2 id="request-h">{s.formTitle}</h2>
      <fieldset className="field">
        <legend>{s.service}</legend>
        <div className="chips">
          {SERVICE_KEYS.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={service === k} onClick={() => setService(k)}>
              <ServiceIcon service={k} size={22} />
              {names[k]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="row">
        <div className="field">
          <label htmlFor="sr-date">{s.date}</label>
          <input id="sr-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sr-pax">{s.people}</label>
          <input id="sr-pax" type="number" inputMode="numeric" min={1} max={100} value={pax} onChange={(e) => setPax(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sr-note">{s.note}</label>
        <textarea id="sr-note" rows={3} maxLength={1000} placeholder={s.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <ContactForm
        idPrefix="sr"
        title={s.request}
        disclaimer={s.disclaimer}
        onSubmit={(c) => createServiceRequest({ ...c, locale, service, date, pax, note })}
      />
    </div>
  );
}
