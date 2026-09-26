"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteTour, saveTour } from "@/app/admin/actions";
import { KIND_LABEL, SCENE_KEYS, SCENE_LABEL, type Tour } from "@/lib/data";
import { ConfirmButton, SubmitButton } from "./Controls";

const on = (b: boolean | undefined) => (b ? "on" : "");

export function TourForm({ tour: t }: { tour?: Tour }) {
  const [state, action] = useActionState(saveTour, null);

  // After a failed save the submitted values win, so nothing the admin typed is lost
  const d: Record<string, string> = state?.values ?? {
    title: t?.title ?? "",
    kind: t?.kind ?? "abroad",
    country: t?.country ?? "",
    scene: t?.scene ?? "terelj",
    startDate: t?.startDate ?? "",
    endDate: t?.endDate ?? "",
    price: t ? String(t.price) : "",
    seats: String(t?.seats ?? 10),
    route: t?.route.join("\n") ?? "Улаанбаатар\n\nУлаанбаатар",
    badge: t?.badge ?? "",
    hot: on(t?.hot),
    published: on(t?.published ?? true),
    upcoming: on(t?.upcoming),
    featured: on(t?.featured),
    heroEyebrow: t?.heroEyebrow ?? "",
    titleEn: t?.titleEn ?? "",
    countryEn: t?.countryEn ?? "",
    routeEn: t?.routeEn.join("\n") ?? "",
    heroEyebrowEn: t?.heroEyebrowEn ?? "",
  };

  return (
    <>
      {state?.error && (
        <p className="a-alert" role="alert">
          {state.error}
        </p>
      )}
      <form action={action} className="a-form">
        {t && <input type="hidden" name="id" value={t.id} />}

        <section className="a-card">
          <h2>Үндсэн мэдээлэл</h2>
          <div className="field">
            <label htmlFor="title">Гарчиг</label>
            <input id="title" name="title" defaultValue={d.title} required maxLength={160} />
          </div>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="kind">Төрөл</label>
              <select id="kind" name="kind" defaultValue={d.kind}>
                {Object.entries(KIND_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="country">Чиглэл (улс / аймаг)</label>
              <input id="country" name="country" defaultValue={d.country} required placeholder="БНХАУ" />
            </div>
            <div className="field">
              <label htmlFor="scene">Зураг</label>
              <select id="scene" name="scene" defaultValue={d.scene}>
                {SCENE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SCENE_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="a-grid4">
            <div className="field">
              <label htmlFor="startDate">Эхлэх огноо</label>
              <input id="startDate" name="startDate" type="date" defaultValue={d.startDate} required />
            </div>
            <div className="field">
              <label htmlFor="endDate">Дуусах огноо</label>
              <input id="endDate" name="endDate" type="date" defaultValue={d.endDate} required />
            </div>
            <div className="field">
              <label htmlFor="price">1 хүний үнэ (₮)</label>
              <input id="price" name="price" type="number" min={1} defaultValue={d.price} required />
            </div>
            <div className="field">
              <label htmlFor="seats">Үлдсэн суудал</label>
              <input id="seats" name="seats" type="number" min={0} defaultValue={d.seats} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="route">Маршрут — мөр бүрт нэг цэг</label>
            <textarea id="route" name="route" rows={5} defaultValue={d.route} required />
          </div>
        </section>

        <section className="a-card">
          <h2>Тэмдэг ба байршил</h2>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="badge">Тэмдэг</label>
              <input id="badge" name="badge" list="badges" defaultValue={d.badge} placeholder="Хоосон бол харагдахгүй" />
              <datalist id="badges">
                <option value="ОНЦЛОХ" />
                <option value="ЭРЭЛТТЭЙ" />
                <option value="ХЯМДРАЛТАЙ" />
                <option value="ШИНЭ" />
              </datalist>
            </div>
            <label className="a-check">
              <input type="checkbox" name="hot" defaultChecked={d.hot === "on"} /> Тэмдгийг улаанаар
            </label>
          </div>
          <div className="a-checks">
            <label className="a-check">
              <input type="checkbox" name="published" defaultChecked={d.published === "on"} /> Сайт дээр нийтлэх
            </label>
            <label className="a-check">
              <input type="checkbox" name="upcoming" defaultChecked={d.upcoming === "on"} /> “Ойрын аялал” хэсэгт харуулах
            </label>
            <label className="a-check">
              <input type="checkbox" name="featured" defaultChecked={d.featured === "on"} /> Нүүрний slider-т харуулах
            </label>
          </div>
          <div className="field">
            <label htmlFor="heroEyebrow">Slider дээрх жижиг бичиг</label>
            <input id="heroEyebrow" name="heroEyebrow" defaultValue={d.heroEyebrow} placeholder="Жишээ: Үлдэгдэл 2 суудал" />
          </div>
        </section>

        <section className="a-card">
          <div>
            <h2>English</h2>
            <p className="a-hint">Сайтыг EN хэлээр үзэхэд харагдана. Хоосон үлдээвэл монгол текст гарна.</p>
          </div>
          <div className="field">
            <label htmlFor="titleEn">Title</label>
            <input id="titleEn" name="titleEn" lang="en" defaultValue={d.titleEn} maxLength={160} />
          </div>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="countryEn">Destination</label>
              <input id="countryEn" name="countryEn" lang="en" defaultValue={d.countryEn} placeholder="China" />
            </div>
            <div className="field a-span2">
              <label htmlFor="heroEyebrowEn">Slider label</label>
              <input id="heroEyebrowEn" name="heroEyebrowEn" lang="en" defaultValue={d.heroEyebrowEn} placeholder="e.g. Only 2 seats left" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="routeEn">Route — one stop per line, same order as Mongolian</label>
            <textarea id="routeEn" name="routeEn" lang="en" rows={4} defaultValue={d.routeEn} />
          </div>
        </section>

        <div className="a-actions">
          <Link href="/admin/tours" className="btn ghost">
            Болих
          </Link>
          <SubmitButton>{t ? "Хадгалах" : "Аялал нэмэх"}</SubmitButton>
        </div>
      </form>

      {t && (
        <section className="a-card a-danger-zone">
          <div>
            <h2>Аялал устгах</h2>
            <p>Устгасан аяллыг сэргээх боломжгүй. Түр нуух бол “Сайт дээр нийтлэх”-ийг болиулна уу.</p>
          </div>
          <form action={deleteTour}>
            <input type="hidden" name="id" value={t.id} />
            <ConfirmButton message={`“${t.title}” аяллыг устгах уу?`}>Устгах</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
