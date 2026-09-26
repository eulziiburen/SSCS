import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import { fmt } from "@/lib/data";
import { getBookings, getTours } from "@/lib/queries";

export default async function AdminHome() {
  const [bookings, tours] = await Promise.all([getBookings(), getTours({ includeHidden: true })]);
  const today = new Date().toISOString().slice(0, 10);
  const active = bookings.filter((b) => b.status !== "cancelled");
  const confirmedSum = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total, 0);
  const lowSeats = tours.filter((t) => t.published && t.startDate >= today && t.seats <= 3);

  const stats = [
    { label: "Шинэ захиалга", value: bookings.filter((b) => b.status === "new").length, href: "/admin/bookings?status=new", accent: true },
    { label: "Нийт идэвхтэй захиалга", value: active.length, href: "/admin/bookings" },
    { label: "Баталгаажсан дүн", value: fmt(confirmedSum), href: "/admin/bookings?status=confirmed" },
    { label: "Нийтлэгдсэн аялал", value: `${tours.filter((t) => t.published).length} / ${tours.length}`, href: "/admin/tours" },
  ];

  return (
    <>
      <h1 className="a-title">Тойм</h1>
      <div className="a-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`a-stat${s.accent ? " accent" : ""}`}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </Link>
        ))}
      </div>

      {lowSeats.length > 0 && (
        <section className="a-card">
          <h2>Суудал дуусч байгаа аялал</h2>
          <ul className="a-list">
            {lowSeats.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/tours/${t.id}`}>{t.title}</Link>
                <span className={t.seats === 0 ? "a-pill red" : "a-pill amber"}>{t.seats} суудал</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="a-card">
        <div className="a-card-head">
          <h2>Сүүлийн захиалгууд</h2>
          <Link href="/admin/bookings" className="a-link">
            Бүгдийг харах →
          </Link>
        </div>
        <BookingTable bookings={bookings.slice(0, 8)} compact />
      </section>
    </>
  );
}
