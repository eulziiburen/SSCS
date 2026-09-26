"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Тойм" },
  { href: "/admin/bookings", label: "Захиалгууд" },
  { href: "/admin/tours", label: "Аялалууд" },
  { href: "/admin/news", label: "Мэдээ" },
  { href: "/admin/home", label: "Нүүр хуудас" },
  { href: "/admin/settings", label: "Тооцоолуур" },
];

export function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="a-nav" aria-label="Admin цэс">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
            {i.label}
            {i.href === "/admin/bookings" && newCount > 0 && <span className="a-count">{newCount}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
