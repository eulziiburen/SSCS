import type { Metadata } from "next";
import Link from "next/link";
import { saveStats } from "@/app/st-admin/actions";
import { SubmitButton } from "@/components/admin/Controls";
import { getHomeStats } from "@/lib/queries";
import { MAX_STATS } from "@/lib/stats";

export const metadata: Metadata = { title: "Нүүр хуудас" };

export default async function HomeSettings({ searchParams }: PageProps<"/st-admin/home">) {
  const [{ saved }, stats] = await Promise.all([searchParams, getHomeStats()]);
  const rows = Array.from({ length: MAX_STATS }, (_, i) => stats[i] ?? { value: "", mn: "", en: "" });

  return (
    <>
      <div className="a-head">
        <h1 className="a-title">Нүүр хуудас</h1>
        <Link href="/#main" className="a-link" target="_blank">
          Сайт дээр харах ↗
        </Link>
      </div>
      {saved && (
        <p className="a-alert ok" role="status">
          Хадгалагдлаа.
        </p>
      )}
      <form action={saveStats} className="a-form">
        <section className="a-card">
          <div>
            <h2>Тоон үзүүлэлтүүд</h2>
            <p className="a-hint">Хайлтын хэсгийн доор харагдана. Тоог хоосон үлдээвэл тухайн мөр харагдахгүй.</p>
          </div>
          <div className="a-stats-edit">
            <span className="label">Тоо</span>
            <span className="label">Тайлбар (MN)</span>
            <span className="label">Тайлбар (EN)</span>
            {rows.map((s, i) => (
              <div className="a-stats-row" key={i}>
                <input name={`value${i}`} defaultValue={s.value} placeholder="12+" aria-label={`${i + 1}-р тоо`} />
                <input name={`mn${i}`} defaultValue={s.mn} placeholder="жил туршлага" aria-label={`${i + 1}-р тайлбар (MN)`} />
                <input name={`en${i}`} lang="en" defaultValue={s.en} placeholder="years of experience" aria-label={`${i + 1}-р тайлбар (EN)`} />
              </div>
            ))}
          </div>
        </section>
        <div className="a-actions">
          <SubmitButton>Хадгалах</SubmitButton>
        </div>
      </form>
    </>
  );
}
