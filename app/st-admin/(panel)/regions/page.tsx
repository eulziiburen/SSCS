import type { Metadata } from "next";
import Link from "next/link";
import { getHotels, getRegions } from "@/lib/queries";

export const metadata: Metadata = { title: "Монгол орон" };

export default async function RegionsAdmin({ searchParams }: PageProps<"/st-admin/regions">) {
  const [{ saved }, regions, hotels] = await Promise.all([searchParams, getRegions(), getHotels({ includeHidden: true })]);

  return (
    <>
      <div className="a-head">
        <h1 className="a-title">Монгол орон — аймгууд</h1>
        <Link href="/mongolia" className="a-link" target="_blank">
          Газрын зургийг харах ↗
        </Link>
      </div>
      <p className="a-hint">Аймаг дээр дарж түүх, соёл, үзэх газрууд болон зургийг засна. Эдгээр нь газрын зураг болон “Аялал зохиох” хуудсанд харагдана.</p>
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
                <th>Аймаг</th>
                <th>Төв</th>
                <th className="num">Үзэх газар</th>
                <th className="num">Буудал</th>
                <th>Зураг</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.code}>
                  <td>
                    <Link href={`/st-admin/regions/${r.code}`}>
                      <strong>{r.name}</strong>
                    </Link>
                    <small>{r.nameEn}</small>
                  </td>
                  <td>{r.center}</td>
                  <td className="num mono">{r.attractions.length}</td>
                  <td className="num mono">{hotels.filter((h) => h.regionCode === r.code).length}</td>
                  <td>{r.imageId ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
