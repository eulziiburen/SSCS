"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/st-admin", label: "Тойм" },
  { href: "/st-admin/bookings", label: "Захиалгууд" },
  { href: "/st-admin/tours", label: "Аялалууд" },
  { href: "/st-admin/hotels", label: "Зочид буудал" },
  { href: "/st-admin/regions", label: "Монгол орон" },
  { href: "/st-admin/news", label: "Мэдээ" },
  { href: "/st-admin/reviews", label: "Сэтгэгдэл" },
  { href: "/st-admin/users", label: "Хэрэглэгчид" },
  { href: "/st-admin/home", label: "Нүүр хуудас" },
  { href: "/st-admin/settings", label: "Тооцоолуур" },
];

export function AdminNav({ newCount, pendingReviews }: { newCount: number; pendingReviews: number }) {
  const pathname = usePathname();
  return (
    <nav className="a-nav" aria-label="Admin цэс">
      {ITEMS.map((i) => {
        const active = i.href === "/st-admin" ? pathname === "/st-admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
            {i.label}
            {i.href === "/st-admin/bookings" && newCount > 0 && <span className="a-count">{newCount}</span>}
            {i.href === "/st-admin/reviews" && pendingReviews > 0 && <span className="a-count">{pendingReviews}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
