"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, MenuIcon, MoonIcon, SunIcon, XIcon } from "./Icons";

const NAV = [
  { href: "/tours", label: "Аялалууд" },
  { href: "/#upcoming", label: "Ойрын аялал" },
  { href: "/#services", label: "Үйлчилгээ" },
  { href: "/#news", label: "Мэдээ" },
  { href: "/#contact", label: "Холбоо барих" },
];

function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

// The active option is highlighted purely in CSS (see .theme-switch), so the server
// render never has to guess the visitor's theme.
function ThemeSwitch() {
  return (
    <div className="theme-switch" role="group" aria-label="Өнгөний горим">
      <button type="button" className="t-light" onClick={() => setTheme("light")}>
        <SunIcon width={16} height={16} />
        <span>Цайвар</span>
      </button>
      <button type="button" className="t-dark" onClick={() => setTheme("dark")}>
        <MoonIcon width={16} height={16} />
        <span>Бараан</span>
      </button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <Link className="logo" href="/" aria-label="Тал Аялал нүүр">
          <Logo />
          ТАЛ АЯЛАЛ
        </Link>
        <nav className={`nav${open ? " open" : ""}`} id="main-nav" aria-label="Үндсэн цэс">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) && n.href !== "/" && !n.href.includes("#") ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <a className="btn nav-cta" href="tel:+97670000000">
            (+976) 7000-0000
          </a>
        </nav>
        <ThemeSwitch />
        <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="main-nav" aria-label="Цэс" onClick={() => setOpen((o) => !o)}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
