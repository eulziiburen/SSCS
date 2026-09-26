import Link from "next/link";
import { deleteBooking, saveBookingNote, setBookingStatus } from "@/app/admin/actions";
import type { BookingRow } from "@/db/schema";
import { BOOKING_STATUS, fmt } from "@/lib/data";
import { AutoSelect, ConfirmButton } from "./Controls";

const when = (iso: string) => {
  const d = new Date(iso);
  // Admins work in Ulaanbaatar time regardless of where the server runs
  return d.toLocaleString("sv-SE", { timeZone: "Asia/Ulaanbaatar", dateStyle: "short", timeStyle: "short" });
};

export function BookingTable({ bookings, compact = false }: { bookings: BookingRow[]; compact?: boolean }) {
  if (!bookings.length) return <p className="a-empty">Захиалга алга.</p>;
  return (
    <div className="a-table-wrap">
      <table className="a-table">
        <thead>
          <tr>
            <th>Дугаар / огноо</th>
            <th>Захиалагч</th>
            <th>Аялал</th>
            <th className="num">Дүн</th>
            <th>Төлөв</th>
            {!compact && <th>Тэмдэглэл</th>}
            {!compact && <th aria-label="Үйлдэл" />}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} data-status={b.status}>
              <td>
                <span className="mono">{b.code}</span>
                <small>{when(b.createdAt)}</small>
              </td>
              <td>
                <strong>{b.name}</strong>
                <small>
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>
                </small>
              </td>
              <td>
                {b.tourId ? <Link href={`/admin/tours/${b.tourId}`}>{b.tourTitle}</Link> : b.tourTitle}
                <small>
                  {b.pax} × {fmt(b.unitPrice)}
                </small>
              </td>
              <td className="num mono">{fmt(b.total)}</td>
              <td>
                <form action={setBookingStatus}>
                  <input type="hidden" name="id" value={b.id} />
                  <AutoSelect name="status" defaultValue={b.status} options={BOOKING_STATUS} label={`${b.code} төлөв`} className={`a-status s-${b.status}`} />
                </form>
              </td>
              {!compact && (
                <td>
                  <form action={saveBookingNote} className="a-note">
                    <input type="hidden" name="id" value={b.id} />
                    <input name="note" defaultValue={b.note ?? ""} placeholder="Тэмдэглэл…" aria-label={`${b.code} тэмдэглэл`} />
                    <button type="submit" className="a-btn sm">
                      Хадгалах
                    </button>
                  </form>
                </td>
              )}
              {!compact && (
                <td>
                  <form action={deleteBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmButton message={`${b.code} захиалгыг устгах уу?`} className="a-btn sm danger">
                      Устгах
                    </ConfirmButton>
                  </form>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
