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

function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
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
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Өнгөний горим солих">
          <MoonIcon className="show-light" />
          <SunIcon className="show-dark" />
        </button>
        <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="main-nav" aria-label="Цэс" onClick={() => setOpen((o) => !o)}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
