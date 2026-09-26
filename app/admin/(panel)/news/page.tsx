import type { Metadata } from "next";
import Link from "next/link";
import { deleteNews, saveNews } from "@/app/admin/actions";
import { ConfirmButton, SubmitButton } from "@/components/admin/Controls";
import { dotDate } from "@/lib/data";
import { getNews } from "@/lib/queries";

export const metadata: Metadata = { title: "Мэдээ" };

export default async function NewsAdmin({ searchParams }: PageProps<"/admin/news">) {
  const { edit, error } = await searchParams;
  const items = await getNews({ includeHidden: true });
  const editing = items.find((n) => String(n.id) === edit);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <h1 className="a-title">Мэдээ</h1>
      <div className="a-split">
        <section className="a-card">
          <div className="a-card-head">
            <h2>{editing ? "Мэдээ засах" : "Шинэ мэдээ"}</h2>
            {editing && (
              <Link href="/admin/news" className="a-link">
                Болих
              </Link>
            )}
          </div>
          {typeof error === "string" && (
            <p className="a-alert" role="alert">
              {error}
            </p>
          )}
          {/* key remounts the form so defaults switch when another item is picked */}
          <form action={saveNews} className="a-form" key={editing?.id ?? "new"}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="field">
              <label htmlFor="n-date">Огноо</label>
              <input id="n-date" name="date" type="date" defaultValue={editing?.date ?? today} required />
            </div>
            <div className="field">
              <label htmlFor="n-title">Гарчиг</label>
              <input id="n-title" name="title" defaultValue={editing?.title} required maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="n-text">Агуулга</label>
              <textarea id="n-text" name="text" rows={5} defaultValue={editing?.text} required />
            </div>
            <label className="a-check">
              <input type="checkbox" name="published" defaultChecked={editing?.published ?? true} /> Нийтлэх
            </label>
            <SubmitButton>{editing ? "Хадгалах" : "Нэмэх"}</SubmitButton>
          </form>
        </section>

        <section className="a-card flush">
          {items.length === 0 && <p className="a-empty">Мэдээ алга.</p>}
          <ul className="a-news">
            {items.map((n) => (
              <li key={n.id} className={`${!n.published ? "muted" : ""}${editing?.id === n.id ? " sel" : ""}`}>
                <div>
                  <time className="mono">{dotDate(n.date)}</time>
                  {!n.published && <span className="a-pill">Нуусан</span>}
                  <strong>{n.title}</strong>
                  <p>{n.text}</p>
                </div>
                <div className="a-row-actions">
                  <Link href={`/admin/news?edit=${n.id}`} className="a-btn sm">
                    Засах
                  </Link>
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <ConfirmButton message="Энэ мэдээг устгах уу?" className="a-btn sm danger">
                      Устгах
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
