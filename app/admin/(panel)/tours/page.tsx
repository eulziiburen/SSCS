import type { Metadata } from "next";
import Link from "next/link";
import { toggleTour } from "@/app/admin/actions";
import { SceneArt } from "@/components/SceneArt";
import { dateRange, fmt, KIND_LABEL } from "@/lib/data";
import { getTours } from "@/lib/queries";

export const metadata: Metadata = { title: "Аялалууд" };

function Toggle({ id, field, on, label }: { id: number; field: string; on: boolean; label: string }) {
  return (
    <form action={toggleTour}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={on ? "0" : "1"} />
      <button type="submit" className={`a-toggle${on ? " on" : ""}`} aria-pressed={on} title={label}>
        {label}
      </button>
    </form>
  );
}

export default async function ToursAdmin({ searchParams }: PageProps<"/admin/tours">) {
  const { saved } = await searchParams;
  const tours = await getTours({ includeHidden: true });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="a-head">
        <h1 className="a-title">Аялалууд</h1>
        <Link href="/admin/tours/new" className="btn">
          + Шинэ аялал
        </Link>
      </div>
      {saved && (
        <p className="a-alert ok" role="status">
          Хадгалагдлаа.
        </p>
      )}
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Аялал</th>
                <th>Огноо</th>
                <th className="num">Үнэ</th>
                <th className="num">Суудал</th>
                <th>Харагдах байдал</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr key={t.id} className={!t.published ? "muted" : undefined}>
                  <td>
                    <div className="a-tour">
                      <span className="a-thumb">
                        <SceneArt scene={t.scene} id={`a${t.id}`} />
                      </span>
                      <div>
                        <Link href={`/admin/tours/${t.id}`}>
                          <strong>{t.title}</strong>
                        </Link>
                        <small>
                          {KIND_LABEL[t.kind]} · {t.country}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="mono">
                    {dateRange(t)}
                    {t.endDate < today && <small className="a-pill">Өнгөрсөн</small>}
                  </td>
                  <td className="num mono">{fmt(t.price)}</td>
                  <td className={`num mono${t.seats <= 3 ? " red" : ""}`}>{t.seats}</td>
                  <td>
                    <div className="a-toggles">
                      <Toggle id={t.id} field="published" on={t.published} label="Нийтлэгдсэн" />
                      <Toggle id={t.id} field="featured" on={t.featured} label="Нүүр slider" />
                      <Toggle id={t.id} field="upcoming" on={t.upcoming} label="Ойрын аялал" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
