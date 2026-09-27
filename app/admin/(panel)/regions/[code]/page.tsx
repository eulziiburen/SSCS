import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveRegion } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/Controls";
import { ImageField } from "@/components/admin/ImageField";
import { imageUrl } from "@/components/TourVisual";
import { getRegion } from "@/lib/queries";

export const metadata: Metadata = { title: "Аймаг засах" };

// Mongolian and English side by side so translations stay in step
function Pair({ id, label, mn, en, rows }: { id: string; label: string; mn: string; en: string; rows?: number }) {
  const Tag = rows ? "textarea" : "input";
  return (
    <div className="a-pair">
      <div className="field">
        <label htmlFor={id}>{label} (MN)</label>
        <Tag id={id} name={id} defaultValue={mn} rows={rows} />
      </div>
      <div className="field">
        <label htmlFor={`${id}En`}>{label} (EN)</label>
        <Tag id={`${id}En`} name={`${id}En`} lang="en" defaultValue={en} rows={rows} />
      </div>
    </div>
  );
}

export default async function EditRegion({ params, searchParams }: PageProps<"/admin/regions/[code]">) {
  const [{ code }, { error }] = await Promise.all([params, searchParams]);
  const r = await getRegion(code);
  if (!r) notFound();

  return (
    <>
      <nav className="crumbs">
        <Link href="/admin/regions">Монгол орон</Link> / <span>{r.name}</span>
      </nav>
      <div className="a-head">
        <h1 className="a-title">{r.name}</h1>
        <Link href={`/mongolia?region=${r.code}`} className="a-link" target="_blank">
          Сайт дээр харах ↗
        </Link>
      </div>
      {typeof error === "string" && (
        <p className="a-alert" role="alert">
          {error}
        </p>
      )}
      <form action={saveRegion} className="a-form">
        <input type="hidden" name="code" value={r.code} />
        <section className="a-card">
          <h2>Нэр, төв</h2>
          <Pair id="name" label="Нэр" mn={r.name} en={r.nameEn} />
          <Pair id="center" label="Төв хот" mn={r.center} en={r.centerEn} />
        </section>
        <section className="a-card">
          <h2>Танилцуулга</h2>
          <Pair id="summary" label="Товч" mn={r.summary} en={r.summaryEn} rows={2} />
          <Pair id="history" label="Түүх" mn={r.history} en={r.historyEn} rows={4} />
          <Pair id="culture" label="Соёл, ёс заншил" mn={r.culture} en={r.cultureEn} rows={3} />
        </section>
        <section className="a-card">
          <div>
            <h2>Үзэх газрууд</h2>
            <p className="a-hint">Мөр бүрт нэг газар. Англи жагсаалт монголтой ижил дараалалтай, ижил тоотой байх ёстой — эс бөгөөс англи хувилбарт монгол нэр харагдана.</p>
          </div>
          <Pair id="attractions" label="Газрууд" mn={r.attractions.join("\n")} en={r.attractionsEn.join("\n")} rows={6} />
        </section>
        <section className="a-card">
          <h2>Зураг</h2>
          <ImageField name="image" label="Газрын зургийн хажуугийн самбарт харагдана" currentUrl={r.imageId ? imageUrl(r.imageId) : null} />
        </section>
        <div className="a-actions">
          <Link href="/admin/regions" className="btn ghost">
            Болих
          </Link>
          <SubmitButton>Хадгалах</SubmitButton>
        </div>
      </form>
    </>
  );
}
