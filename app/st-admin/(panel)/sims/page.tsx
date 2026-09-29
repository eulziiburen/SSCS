import type { Metadata } from "next";
import Link from "next/link";
import { deleteSim, saveSim } from "@/app/st-admin/actions";
import { ConfirmButton, SubmitButton } from "@/components/admin/Controls";
import { countryName } from "@/lib/countries";
import { fmt } from "@/lib/data";
import { getSimPlans } from "@/lib/queries";
import { SIM_ACTIVATION, SIM_ACTIVATION_MN, SIM_KIND_MN, SIM_KINDS, simSpecMn } from "@/lib/sims";

export const metadata: Metadata = { title: "Дата сим" };

export default async function SimsAdmin({ searchParams }: PageProps<"/st-admin/sims">) {
  const { edit, error } = await searchParams;
  const plans = await getSimPlans({ includeHidden: true });
  const editing = plans.find((p) => String(p.id) === edit);

  return (
    <>
      <h1 className="a-title">Дата сим</h1>
      <p className="a-lead">
        Сайтын “Үйлчилгээ → Дата сим” хуудсанд харагдах багцууд. Захиалга “Захиалгууд” хэсэгт “Үйлчилгээ” төрлөөр орж ирнэ.
      </p>
      <div className="a-split">
        <section className="a-card">
          <div className="a-card-head">
            <h2>{editing ? "Багц засах" : "Шинэ багц"}</h2>
            {editing && (
              <Link href="/st-admin/sims" className="a-link">
                Болих
              </Link>
            )}
          </div>
          {typeof error === "string" && (
            <p className="a-alert" role="alert">
              {error}
            </p>
          )}
          <form action={saveSim} className="a-form" key={editing?.id ?? "new"}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="field">
              <label htmlFor="s-countries">Улсын код (таслалаар)</label>
              <input id="s-countries" name="countries" defaultValue={editing?.countries.join(", ")} required placeholder="JP  эсвэл  US, CA, MX" />
              <small className="a-hint">2 үсэгтэй ISO код: JP Япон, KR Солонгос, CN Хятад, US АНУ, GB Их Британи, TH Тайланд, EU Европ…</small>
            </div>
            <div className="field">
              <label htmlFor="s-title">Нэр</label>
              <input id="s-title" name="title" defaultValue={editing?.title} required maxLength={120} placeholder="АНУ, Канад" />
            </div>
            <div className="field">
              <label htmlFor="s-title-en">Name (English)</label>
              <input id="s-title-en" name="titleEn" lang="en" defaultValue={editing?.titleEn ?? ""} maxLength={120} placeholder="Хоосон бол монгол нэр гарна" />
            </div>
            <div className="a-grid3">
              <div className="field">
                <label htmlFor="s-kind">Төрөл</label>
                <select id="s-kind" name="kind" defaultValue={editing?.kind ?? "total"}>
                  {SIM_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {SIM_KIND_MN[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="s-data">Дата</label>
                <input id="s-data" name="dataAmount" defaultValue={editing?.dataAmount} placeholder="500MB / 3GB" />
              </div>
              <div className="field">
                <label htmlFor="s-days">Хоног</label>
                <input id="s-days" name="days" type="number" min={1} defaultValue={editing?.days ?? 7} required />
              </div>
            </div>
            <div className="a-grid3">
              <div className="field">
                <label htmlFor="s-act">Идэвхжүүлэлт</label>
                <select id="s-act" name="activation" defaultValue={editing?.activation ?? "anytime"}>
                  {SIM_ACTIVATION.map((a) => (
                    <option key={a} value={a}>
                      {SIM_ACTIVATION_MN[a]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="s-within">Хэдэн хоногт идэвхжүүлэх</label>
                <input id="s-within" name="activateWithin" type="number" min={1} defaultValue={editing?.activateWithin ?? ""} placeholder="Жишээ: 180" />
              </div>
              <div className="field">
                <label htmlFor="s-price">Үнэ (₮)</label>
                <input id="s-price" name="price" type="number" min={1} defaultValue={editing?.price} required />
              </div>
            </div>
            <div className="a-grid3">
              <div className="field">
                <label htmlFor="s-sort">Эрэмбэ</label>
                <input id="s-sort" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
              </div>
              <label className="a-check">
                <input type="checkbox" name="published" defaultChecked={editing?.published ?? true} /> Нийтлэх
              </label>
            </div>
            <SubmitButton>{editing ? "Хадгалах" : "Нэмэх"}</SubmitButton>
          </form>
        </section>

        <section className="a-card flush">
          {plans.length === 0 && <p className="a-empty">Багц алга. Зүүн талаас нэмнэ үү.</p>}
          <ul className="a-news">
            {plans.map((p) => (
              <li key={p.id} className={`${!p.published ? "muted" : ""}${editing?.id === p.id ? " sel" : ""}`}>
                <div>
                  <span className="mono a-sub">{p.countries.join(" · ")}</span>
                  {!p.published && <span className="a-pill">Нуусан</span>}
                  <strong>
                    {p.title} — {fmt(p.price)}
                  </strong>
                  <p>
                    {simSpecMn(p)} · {SIM_ACTIVATION_MN[p.activation]}
                    {p.activateWithin ? ` · ${p.activateWithin} хоногт идэвхжүүлнэ` : ""}
                  </p>
                  <small className="a-sub">{p.countries.map((c) => countryName(c, "mn")).join(", ")}</small>
                </div>
                <div className="a-row-actions">
                  <Link href={`/st-admin/sims?edit=${p.id}`} className="a-btn sm">
                    Засах
                  </Link>
                  <form action={deleteSim}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message="Энэ багцыг устгах уу?" className="a-btn sm danger">
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
