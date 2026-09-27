"use client";

import { Fragment, useActionState, useRef } from "react";
import { submitReview, type ReviewState } from "@/app/actions";
import { CheckIcon, XIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";

export function ReviewButton() {
  const { locale, t } = useI18n();
  const r = t.review;
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, null);
  const values = state && !state.ok ? state.values : null;

  const open = () => {
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLElement>("#rv-name")?.focus();
  };
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className="btn ghost" onClick={open}>
        {r.write}
      </button>
      <dialog
        ref={dialog}
        className="dlg"
        aria-labelledby="rv-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {state?.ok ? (
          <div className="dlg-body ok">
            <span className="ok-icon">
              <CheckIcon width={28} height={28} />
            </span>
            <h3 id="rv-title">{r.doneTitle}</h3>
            <p>{r.doneText}</p>
            <button type="button" className="btn" onClick={close}>
              {r.close}
            </button>
          </div>
        ) : (
          // key remounts the fields so values echoed back after an error become their defaults
          <form className="dlg-body" action={action} key={values ? JSON.stringify(values) : "new"}>
            <div className="dlg-head">
              <h3 id="rv-title">{r.title}</h3>
              <button type="button" className="icon-btn" onClick={close} aria-label={r.close}>
                <XIcon />
              </button>
            </div>
            <p className="rv-note">{r.lead}</p>
            <input type="hidden" name="locale" value={locale} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
            <div className="field">
              <label htmlFor="rv-name">{r.name}</label>
              <input id="rv-name" name="name" required maxLength={60} autoComplete="given-name" placeholder={r.namePlaceholder} defaultValue={values?.name} />
            </div>
            <div className="field">
              <label htmlFor="rv-email">{r.email}</label>
              <input id="rv-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder={t.booking.emailPlaceholder} defaultValue={values?.email} aria-describedby="rv-email-note" />
              <small id="rv-email-note" className="rv-note">
                {r.emailNote}
              </small>
            </div>
            <div className="field">
              <label htmlFor="rv-trip">{r.trip}</label>
              <input id="rv-trip" name="trip" maxLength={80} placeholder={r.tripPlaceholder} defaultValue={values?.trip} />
            </div>
            <fieldset className="field">
              <legend>{r.rating}</legend>
              {/* Reversed so the CSS sibling selector can light up every star up to the chosen one */}
              <div className="rate">
                {[5, 4, 3, 2, 1].map((n) => (
                  <Fragment key={n}>
                    <input type="radio" id={`rv-r${n}`} name="rating" value={n} defaultChecked={Number(values?.rating ?? 5) === n} />
                    <label htmlFor={`rv-r${n}`} title={r.ratingLabel(n)}>
                      <span aria-hidden="true">★</span>
                      <span className="sr-only">{r.ratingLabel(n)}</span>
                    </label>
                  </Fragment>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="rv-text">{r.text}</label>
              <textarea id="rv-text" name="text" rows={4} required minLength={10} maxLength={1000} placeholder={r.textPlaceholder} defaultValue={values?.text} />
            </div>
            {state && !state.ok && (
              <p className="err" role="alert">
                {state.error}
              </p>
            )}
            <button type="submit" className="btn full" disabled={pending}>
              {pending ? r.sending : r.submit}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
