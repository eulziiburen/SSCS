import type { Metadata } from "next";
import Link from "next/link";
import { toggleHotel } from "@/app/admin/actions";
import { HotelVisual } from "@/components/HotelCard";
import { fmt } from "@/lib/data";
import { HOTEL_CATEGORY_MN, starsLabel } from "@/lib/places";
import { getHotels, getRegions } from "@/lib/queries";

export const metadata: Metadata = { title: "Зочид буудал" };

export default async function HotelsAdmin({ searchParams }: PageProps<"/admin/hotels">) {
  const [{ saved }, hotels, regions] = await Promise.all([searchParams, getHotels({ includeHidden: true }), getRegions()]);
  const regionName = Object.fromEntries(regions.map((r) => [r.code, r.name]));

  return (
    <>
      <div className="a-head">
        <h1 className="a-title">Зочид буудал, байр</h1>
        <Link href="/admin/hotels/new" className="btn">
          + Шинэ буудал
        </Link>
      </div>
      {saved && (
        <p className="a-alert ok" role="status">
          Хадгалагдлаа.
        </p>
      )}
      <section className="a-card flush">
        {hotels.length === 0 ? (
          <p className="a-empty">Буудал бүртгээгүй байна. “+ Шинэ буудал” дарж нэмнэ үү.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Буудал</th>
                  <th>Зэрэглэл</th>
                  <th className="num">Шөнийн үнэ</th>
                  <th>Нийтлэгдсэн</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id} className={!h.published ? "muted" : undefined}>
                    <td>
                      <div className="a-tour">
                        <span className="a-thumb">
                          <HotelVisual hotel={h} />
                        </span>
                        <div>
                          <Link href={`/admin/hotels/${h.id}`}>
                            <strong>{h.name}</strong>
                          </Link>
                          <small>
                            {h.city} · {regionName[h.regionCode] ?? h.regionCode}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {HOTEL_CATEGORY_MN[h.category]}
                      {h.stars > 0 && <small className="stars">{starsLabel(h.stars)}</small>}
                    </td>
                    <td className="num mono">{fmt(h.pricePerNight)}</td>
                    <td>
                      <form action={toggleHotel}>
                        <input type="hidden" name="id" value={h.id} />
                        <input type="hidden" name="value" value={h.published ? "0" : "1"} />
                        <button type="submit" className={`a-toggle${h.published ? " on" : ""}`} aria-pressed={h.published}>
                          {h.published ? "Нийтлэгдсэн" : "Нуусан"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
