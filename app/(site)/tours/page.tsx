import type { Metadata } from "next";
import Link from "next/link";
import { BUDGETS, budgetMillions, MONTHS, SearchForm } from "@/components/SearchForm";
import { TourCard } from "@/components/TourCard";
import { filterTours, localizeTour, type Filter, type Kind } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { getTours } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.toursTitle, description: t.meta.toursDescription };
}

const KINDS: Kind[] = ["abroad", "local", "day"];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function href(f: Filter, patch: Partial<Filter>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...patch })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/tours?${s}` : "/tours";
}

export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const [sp, { locale, t }] = await Promise.all([searchParams, getI18n()]);
  const f: Filter = { q: one(sp.q), kind: one(sp.kind), month: one(sp.month), budget: one(sp.budget), sort: one(sp.sort) };
  const list = filterTours(await getTours(), f).map((x) => localizeTour(x, locale));

  const sorts = [
    { v: "", l: t.list.sortDate },
    { v: "price", l: t.list.sortCheap },
    { v: "price-desc", l: t.list.sortExpensive },
  ];
  const active = [
    f.q && { key: "q" as const, label: `“${f.q}”` },
    f.month && { key: "month" as const, label: MONTHS.includes(Number(f.month)) ? t.search.monthName(Number(f.month)) : f.month },
    f.budget && { key: "budget" as const, label: BUDGETS.includes(f.budget) ? t.search.budgetUpTo(budgetMillions(f.budget)) : f.budget },
  ].filter(Boolean) as { key: keyof Filter; label: string }[];

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.tours}</span>
      </nav>
      <h1 className="page-title">{f.kind && KINDS.includes(f.kind as Kind) ? t.kind[f.kind as Kind] : t.meta.toursTitle}</h1>

      <SearchForm values={f} compact />

      <div className="toolbar">
        <div className="chips" role="list" aria-label={t.home.tourKinds}>
          <Link role="listitem" className="chip" aria-current={!f.kind ? "true" : undefined} href={href(f, { kind: undefined })}>
            {t.list.all}
          </Link>
          {KINDS.map((k) => (
            <Link role="listitem" key={k} className="chip" aria-current={f.kind === k ? "true" : undefined} href={href(f, { kind: k })}>
              {t.kind[k]}
            </Link>
          ))}
        </div>
        <div className="chips sort" role="list" aria-label={t.list.sort}>
          {sorts.map((s) => (
            <Link role="listitem" key={s.v} className="chip ghost" aria-current={(f.sort ?? "") === s.v ? "true" : undefined} href={href(f, { sort: s.v || undefined })}>
              {s.l}
            </Link>
          ))}
        </div>
      </div>

      <div className="result-bar" aria-live="polite">
        <strong>{t.list.found(list.length)}</strong>
        {active.map((a) => (
          <Link key={a.key} className="tag" href={href(f, { [a.key]: undefined })} aria-label={t.list.removeFilter(a.label)}>
            {a.label} ✕
          </Link>
        ))}
        {active.length > 1 && (
          <Link className="clear" href={href({ kind: f.kind, sort: f.sort }, {})}>
            {t.list.clearAll}
          </Link>
        )}
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((x) => (
            <TourCard key={x.id} tour={x} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>{t.list.emptyTitle}</strong>
          <p>{t.list.emptyText}</p>
          <Link className="btn" href="/tours">
            {t.list.seeAll}
          </Link>
        </div>
      )}
    </div>
  );
}
