"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Logo, MenuIcon, XIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";

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

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/tours", label: t.nav.tours },
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
        <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="main-nav" aria-label={t.nav.menu} onClick={() => setOpen((o) => !o)}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
