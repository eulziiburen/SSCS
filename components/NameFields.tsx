"use client";

import { useI18n } from "./LocaleProvider";

type Props = {
  idPrefix: string;
  lastName: string;
  firstName: string;
  onLastName: (v: string) => void;
  onFirstName: (v: string) => void;
  touched: boolean;
  autoFocus?: boolean;
};

// Separate surname / given name, side by side. Mongolian puts the surname (овог) first;
// English forms conventionally ask for the first name first.
export function NameFields({ idPrefix, lastName, firstName, onLastName, onFirstName, touched, autoFocus }: Props) {
  const { locale, t } = useI18n();
  const b = t.booking;
  const lastErr = touched && !lastName.trim() ? b.lastNameError : null;
  const firstErr = touched && !firstName.trim() ? b.firstNameError : null;

  const last = (
    <div className="field" key="last">
      <label htmlFor={`${idPrefix}-last`}>{b.lastName}</label>
      <input
        id={`${idPrefix}-last`}
        autoComplete="family-name"
        placeholder={b.lastNamePlaceholder}
        value={lastName}
        onChange={(e) => onLastName(e.target.value)}
        aria-invalid={!!lastErr}
        aria-describedby={lastErr ? `${idPrefix}-last-err` : undefined}
        autoFocus={autoFocus && locale !== "en"}
      />
      {lastErr && (
        <span className="err" id={`${idPrefix}-last-err`}>
          {lastErr}
        </span>
      )}
    </div>
  );
  const first = (
    <div className="field" key="first">
      <label htmlFor={`${idPrefix}-first`}>{b.firstName}</label>
      <input
        id={`${idPrefix}-first`}
        autoComplete="given-name"
        placeholder={b.firstNamePlaceholder}
        value={firstName}
        onChange={(e) => onFirstName(e.target.value)}
        aria-invalid={!!firstErr}
        aria-describedby={firstErr ? `${idPrefix}-first-err` : undefined}
        autoFocus={autoFocus && locale === "en"}
      />
      {firstErr && (
        <span className="err" id={`${idPrefix}-first-err`}>
          {firstErr}
        </span>
      )}
    </div>
  );

  return <div className="row name-row">{locale === "en" ? [first, last] : [last, first]}</div>;
}
