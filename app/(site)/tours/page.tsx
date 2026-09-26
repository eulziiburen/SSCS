import type { Metadata } from "next";
import Link from "next/link";
import { BUDGETS, MONTHS, SearchForm } from "@/components/SearchForm";
import { TourCard } from "@/components/TourCard";
import { filterTours, KIND_LABEL, type Filter, type Kind } from "@/lib/data";
import { getTours } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Бүх аялал",
  description: "Гадаад, дотоод болон өдрийн аяллуудаас сар, төсвөөр шүүж сонгоорой.",
};

const SORTS = [
  { v: "", l: "Ойрын огноо" },
  { v: "price", l: "Хямд нь эхэнд" },
  { v: "price-desc", l: "Үнэтэй нь эхэнд" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function href(f: Filter, patch: Partial<Filter>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...patch })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/tours?${s}` : "/tours";
}

export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const sp = await searchParams;
  const f: Filter = { q: one(sp.q), kind: one(sp.kind), month: one(sp.month), budget: one(sp.budget), sort: one(sp.sort) };
  const list = filterTours(await getTours(), f);

  const active = [
    f.q && { key: "q" as const, label: `“${f.q}”` },
    f.month && { key: "month" as const, label: MONTHS.find((m) => m.v === f.month)?.l ?? f.month },
    f.budget && { key: "budget" as const, label: BUDGETS.find((b) => b.v === f.budget)?.l ?? f.budget },
  ].filter(Boolean) as { key: keyof Filter; label: string }[];

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Байршил">
        <Link href="/">Нүүр</Link> <span aria-hidden="true">/</span> <span aria-current="page">Аялалууд</span>
      </nav>
      <h1 className="page-title">{f.kind ? KIND_LABEL[f.kind as Kind] : "Бүх аялал"}</h1>

      <SearchForm values={f} compact />

      <div className="toolbar">
        <div className="chips" role="list" aria-label="Аяллын төрөл">
          <Link role="listitem" className="chip" aria-current={!f.kind ? "true" : undefined} href={href(f, { kind: undefined })}>
            Бүгд
          </Link>
          {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
            <Link role="listitem" key={k} className="chip" aria-current={f.kind === k ? "true" : undefined} href={href(f, { kind: k })}>
              {KIND_LABEL[k]}
            </Link>
          ))}
        </div>
        <div className="chips sort" role="list" aria-label="Эрэмбэлэх">
          {SORTS.map((s) => (
            <Link role="listitem" key={s.v} className="chip ghost" aria-current={(f.sort ?? "") === s.v ? "true" : undefined} href={href(f, { sort: s.v || undefined })}>
              {s.l}
            </Link>
          ))}
        </div>
      </div>

      <div className="result-bar" aria-live="polite">
        <strong>{list.length} аялал олдлоо</strong>
        {active.map((a) => (
          <Link key={a.key} className="tag" href={href(f, { [a.key]: undefined })} aria-label={`${a.label} шүүлтүүрийг арилгах`}>
            {a.label} ✕
          </Link>
        ))}
        {active.length > 1 && (
          <Link className="clear" href={href({ kind: f.kind, sort: f.sort }, {})}>
            Бүгдийг арилгах
          </Link>
        )}
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((t) => (
            <TourCard key={t.id} tour={t} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>Тохирох аялал олдсонгүй</strong>
          <p>Өөр сар эсвэл төсөв сонгоод дахин хайна уу.</p>
          <Link className="btn" href="/tours">
            Бүх аяллыг харах
          </Link>
        </div>
      )}
    </div>
  );
}
