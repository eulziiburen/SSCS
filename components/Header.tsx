"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { SERVICE_KEYS } from "@/lib/services";
import { Logo, MenuIcon, XIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";
import { ServiceIcon } from "./ServiceIcon";
import { useUser } from "./UserProvider";

type ThemePref = "light" | "dark" | "system";

function setTheme(pref: ThemePref) {
  const root = document.documentElement;
  root.dataset.themePref = pref;
  if (pref === "system") delete root.dataset.theme;
  else root.dataset.theme = pref;
  try {
    if (pref === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", pref);
  } catch {}
}

const THEME_ICONS: Record<ThemePref, React.ReactNode> = {
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 20h8M12 17v3" />
    </svg>
  ),
};

// The active option is highlighted in CSS from <html data-theme-pref>, which an inline
// script sets before paint, so the server never has to guess the visitor's choice.
function ThemeSwitch() {
  const { t } = useI18n();
  return (
    <div className="seg theme-switch" role="group" aria-label={t.theme.group}>
      {(["light", "dark", "system"] as const).map((p) => (
        <button key={p} type="button" className={`t-${p}`} onClick={() => setTheme(p)} aria-label={t.theme[p]} title={t.theme[p]}>
          {THEME_ICONS[p]}
        </button>
      ))}
    </div>
  );
}

function LangSwitch() {
  const { locale, t } = useI18n();

  function choose(next: Locale) {
    if (next === locale) return;
    // A full load (not a client navigation) so the shared layouts re-render in the new language too.
    // ?lang= goes through the proxy, which also remembers the choice in a cookie.
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url);
  }

  return (
    <div className="seg lang-switch" role="group" aria-label={t.nav.language}>
      {LOCALES.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => choose(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// "Services ▾" disclosure: opens on click (and hover with a mouse), closes on Escape, outside click or navigation
function ServicesMenu({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    };
    addEventListener("pointerdown", onDown);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("pointerdown", onDown);
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A click right after hover-open would otherwise close the menu the pointer just opened
  const hoverOpened = useRef(false);
  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !matchMedia("(min-width: 1241px)").matches) return;
    hoverOpened.current = next;
    setOpen(next);
  };

  return (
    <div className={`nav-drop${open ? " open" : ""}`} ref={root} onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button
        type="button"
        className={pathname.startsWith("/services") ? "active" : undefined}
        aria-expanded={open}
        aria-controls="services-menu"
        onClick={() => {
          if (hoverOpened.current) hoverOpened.current = false;
          else setOpen((o) => !o);
        }}
      >
        {t.svc.menu}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <ul id="services-menu" className="nav-drop-menu">
        {SERVICE_KEYS.map((k, i) => (
          <li key={k}>
            <Link
              href={k === "sim" ? "/services/sim" : `/services#${k}`}
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
            >
              <ServiceIcon service={k} size={32} />
              {t.home.serviceList[i][0]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const user = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/tours", label: t.nav.tours },
    { href: "/calendar", label: t.nav.calendar },
    { href: "/plan", label: t.nav.plan },
    { href: "/mongolia", label: t.nav.mongolia },
    { href: "/hotels", label: t.nav.hotels },
    { href: "/calculator", label: t.nav.calculator },
  ];

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" href="/" aria-label={t.nav.home}>
          <Logo priority />
        </Link>
        <nav className={`nav${open ? " open" : ""}`} id="main-nav" aria-label={t.nav.main}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={!n.href.includes("#") && pathname.startsWith(n.href) ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <ServicesMenu onNavigate={() => setOpen(false)} />
          <div className="nav-tools">
            <LangSwitch />
            <ThemeSwitch />
          </div>
          <a className="btn nav-cta" href="tel:+97670000000">
            (+976) 7000-0000
          </a>
        </nav>
        <div className="header-tools">
          <LangSwitch />
          <ThemeSwitch />
        </div>
        <Link
          href={user ? "/account" : "/login"}
          className={`icon-btn account-btn${user ? " in" : ""}`}
          aria-label={user ? `${t.auth.account}: ${user.firstName}` : t.auth.login}
          title={user ? t.auth.account : t.auth.login}
          aria-current={pathname === "/account" ? "page" : undefined}
        >
          {user ? (
            <span aria-hidden="true">{user.firstName.slice(0, 1).toUpperCase()}</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          )}
        </Link>
        <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="main-nav" aria-label={t.nav.menu} onClick={() => setOpen((o) => !o)}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
