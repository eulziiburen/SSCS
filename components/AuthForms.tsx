"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginWithCode, loginWithPassword, register, requestLoginCode, requestResetCode, resetPassword, type AuthState } from "@/app/account-actions";
import { DEFAULT_DIAL } from "@/lib/phone";
import { useI18n } from "./LocaleProvider";
import { PhoneField } from "./PhoneField";

const AtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3 21 2M16 7l3 3M18 5l2 2" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);

function Hidden({ next }: { next?: string }) {
  const { locale } = useI18n();
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
    </>
  );
}

function Alert({ state }: { state: AuthState }) {
  if (state?.error)
    return (
      <p className="auth-alert err-box" role="alert">
        {state.error}
      </p>
    );
  if (state?.info)
    return (
      <p className="auth-alert info-box" role="status">
        {state.info}
      </p>
    );
  return null;
}

function IconInput({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="icon-input">
      <span className="icon-input-ic">{icon}</span>
      <input {...props} />
    </div>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <button type="submit" className="btn lg full auth-submit" disabled={pending}>
      {pending ? t.auth.sending : children}
    </button>
  );
}

function Remember() {
  const { t } = useI18n();
  return (
    <label className="auth-check">
      <input type="checkbox" name="remember" defaultChecked /> {t.auth.remember}
    </label>
  );
}

/* ---------- sign in ---------- */

export function LoginForm({ next }: { next?: string }) {
  const { t } = useI18n();
  const a = t.auth;
  const [tab, setTab] = useState<"password" | "otp">("password");

  return (
    <>
      <div className="auth-tabs" role="tablist" aria-label={a.login}>
        <button type="button" role="tab" id="tab-pw" aria-controls="panel-pw" aria-selected={tab === "password"} onClick={() => setTab("password")}>
          <KeyIcon /> {a.tabPassword}
        </button>
        <button type="button" role="tab" id="tab-otp" aria-controls="panel-otp" aria-selected={tab === "otp"} onClick={() => setTab("otp")}>
          <PhoneIcon /> {a.tabOtp}
        </button>
      </div>
      <div role="tabpanel" id={tab === "password" ? "panel-pw" : "panel-otp"} aria-labelledby={tab === "password" ? "tab-pw" : "tab-otp"}>
        {tab === "password" ? <PasswordLogin next={next} /> : <OtpLogin next={next} />}
      </div>
      <div className="auth-or">
        <span>{a.or}</span>
      </div>
      <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="btn ghost lg full">
        {a.newUser}
      </Link>
    </>
  );
}

function PasswordLogin({ next }: { next?: string }) {
  const { t } = useI18n();
  const a = t.auth;
  const [state, action, pending] = useActionState(loginWithPassword, null);
  return (
    <form action={action} className="auth-form" key={state?.values?.login ?? ""}>
      <Hidden next={next} />
      <Alert state={state} />
      <div className="field">
        <label htmlFor="l-login">{a.loginField}</label>
        <IconInput icon={<AtIcon />} id="l-login" name="login" required autoComplete="username" placeholder={a.loginPlaceholder} defaultValue={state?.values?.login} autoFocus />
      </div>
      <div className="field">
        <div className="auth-label-row">
          <label htmlFor="l-password">{a.password}</label>
          <Link href="/forgot-password" className="auth-link">
            {a.forgot}
          </Link>
        </div>
        <IconInput icon={<LockIcon />} id="l-password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      <Remember />
      <Submit pending={pending}>{a.login}</Submit>
    </form>
  );
}

function OtpLogin({ next }: { next?: string }) {
  const { t } = useI18n();
  const a = t.auth;
  const [sendState, sendAction, sending] = useActionState(requestLoginCode, null);
  const [verifyState, verifyAction, verifying] = useActionState(loginWithCode, null);
  const [editing, setEditing] = useState(false);
  const login = sendState?.values?.login ?? "";

  if (sendState?.step === "code" && !editing) {
    return (
      <div className="auth-form">
        <Alert state={verifyState ?? sendState} />
        <form action={verifyAction} className="auth-form">
          <Hidden next={next} />
          <input type="hidden" name="login" value={login} />
          <div className="field">
            <label htmlFor="o-code">{a.code}</label>
            <input id="o-code" name="code" className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder={a.codePlaceholder} autoFocus />
          </div>
          <Remember />
          <Submit pending={verifying}>{a.verify}</Submit>
        </form>
        <div className="auth-row">
          <form action={sendAction}>
            <Hidden />
            <input type="hidden" name="login" value={login} />
            <button type="submit" className="auth-link" disabled={sending}>
              {a.resend}
            </button>
          </form>
          <button type="button" className="auth-link" onClick={() => setEditing(true)}>
            {a.changeLogin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={(fd) => (setEditing(false), sendAction(fd))} className="auth-form">
      <Hidden />
      <Alert state={sendState?.step ? null : sendState} />
      <div className="field">
        <label htmlFor="o-login">{a.loginField}</label>
        <IconInput icon={<AtIcon />} id="o-login" name="login" required autoComplete="username" placeholder={a.loginPlaceholder} defaultValue={login} autoFocus />
        <small className="hint">{a.otpNote}</small>
      </div>
      <Submit pending={sending}>{a.sendCode}</Submit>
    </form>
  );
}

/* ---------- register ---------- */

export function RegisterForm({ next }: { next?: string }) {
  const { t } = useI18n();
  const a = t.auth;
  const b = t.booking;
  const [state, action, pending] = useActionState(register, null);
  const v = state?.values;
  const [iso, setIso] = useState(v?.dial || DEFAULT_DIAL.iso);
  const [phone, setPhone] = useState(v?.phone ?? "");

  return (
    <form action={action} className="auth-form" key={v ? JSON.stringify(v) : "new"}>
      <Hidden next={next} />
      <Alert state={state} />
      <div className="row name-row">
        <div className="field">
          <label htmlFor="r-last">{b.lastName}</label>
          <input id="r-last" name="lastName" required maxLength={60} autoComplete="family-name" placeholder={b.lastNamePlaceholder} defaultValue={v?.lastName} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="r-first">{b.firstName}</label>
          <input id="r-first" name="firstName" required maxLength={60} autoComplete="given-name" placeholder={b.firstNamePlaceholder} defaultValue={v?.firstName} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="r-email">{b.email}</label>
        <IconInput icon={<AtIcon />} id="r-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder={b.emailPlaceholder} defaultValue={v?.email} />
      </div>
      <PhoneField id="r-phone" iso={iso} onIso={setIso} value={phone} onChange={setPhone} />
      <input type="hidden" name="dial" value={iso} />
      <input type="hidden" name="phone" value={phone} />
      <div className="field">
        <label htmlFor="r-password">{a.password}</label>
        <IconInput icon={<LockIcon />} id="r-password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" aria-describedby="r-pw-hint" />
        <small className="hint" id="r-pw-hint">
          {a.passwordHint}
        </small>
      </div>
      <div className="field">
        <label htmlFor="r-confirm">{a.confirmPassword}</label>
        <IconInput icon={<LockIcon />} id="r-confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
      </div>
      <Submit pending={pending}>{a.create}</Submit>
    </form>
  );
}

/* ---------- forgot password ---------- */

export function ForgotForm() {
  const { t } = useI18n();
  const a = t.auth;
  const [sendState, sendAction, sending] = useActionState(requestResetCode, null);
  const [resetState, resetAction, resetting] = useActionState(resetPassword, null);
  const login = sendState?.values?.login ?? "";

  if (sendState?.step === "code") {
    return (
      <div className="auth-form">
        <Alert state={resetState ?? sendState} />
        <form action={resetAction} className="auth-form">
          <Hidden />
          <input type="hidden" name="login" value={login} />
          <div className="field">
            <label htmlFor="f-code">{a.code}</label>
            <input id="f-code" name="code" className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder={a.codePlaceholder} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="f-password">{a.newPassword}</label>
            <IconInput icon={<LockIcon />} id="f-password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
            <small className="hint">{a.passwordHint}</small>
          </div>
          <div className="field">
            <label htmlFor="f-confirm">{a.confirmPassword}</label>
            <IconInput icon={<LockIcon />} id="f-confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </div>
          <Submit pending={resetting}>{a.savePassword}</Submit>
        </form>
        <form action={sendAction}>
          <Hidden />
          <input type="hidden" name="login" value={login} />
          <button type="submit" className="auth-link" disabled={sending}>
            {a.resend}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={sendAction} className="auth-form">
      <Hidden />
      <Alert state={sendState} />
      <div className="field">
        <label htmlFor="f-login">{a.loginField}</label>
        <IconInput icon={<AtIcon />} id="f-login" name="login" required autoComplete="username" placeholder={a.loginPlaceholder} defaultValue={login} autoFocus />
      </div>
      <Submit pending={sending}>{a.sendCode}</Submit>
    </form>
  );
}
