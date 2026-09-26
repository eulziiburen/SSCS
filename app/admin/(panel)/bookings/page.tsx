import type { Metadata } from "next";
import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/data";
import { getBookings } from "@/lib/queries";

export const metadata: Metadata = { title: "Захиалгууд" };

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const { status, q } = await searchParams;
  const all = await getBookings();
  const needle = typeof q === "string" ? q.trim().toLowerCase() : "";
  const list = all.filter(
    (b) =>
      (!status || b.status === status) &&
      (!needle || `${b.code} ${b.name} ${b.phone} ${b.tourTitle}`.toLowerCase().includes(needle)),
  );
  const count = (s: BookingStatus) => all.filter((b) => b.status === s).length;

  return (
    <>
      <h1 className="a-title">Захиалгууд</h1>
      <div className="a-toolbar">
        <div className="chips">
          <Link className="chip" href="/admin/bookings" aria-current={!status ? "true" : undefined}>
            Бүгд · {all.length}
          </Link>
          {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => (
            <Link key={s} className="chip" href={`/admin/bookings?status=${s}`} aria-current={status === s ? "true" : undefined}>
              {BOOKING_STATUS[s]} · {count(s)}
            </Link>
          ))}
        </div>
        <form className="a-search" role="search">
          {typeof status === "string" && <input type="hidden" name="status" value={status} />}
          <input name="q" type="search" defaultValue={needle} placeholder="Нэр, утас, дугаараар хайх" aria-label="Захиалга хайх" />
        </form>
      </div>
      <section className="a-card flush">
        <BookingTable bookings={list} />
      </section>
    </>
  );
}
