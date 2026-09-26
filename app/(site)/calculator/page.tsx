import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, CurrencyConverter, type CalcTourOption } from "@/components/Calculator";
import { localizeTour } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { getCalcSettings, getTours } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.calc.metaTitle, description: t.calc.metaDescription };
}

export default async function CalculatorPage({ searchParams }: PageProps<"/calculator">) {
  const [{ tour }, { locale, t }, rawTours, settings] = await Promise.all([searchParams, getI18n(), getTours(), getCalcSettings()]);
  const today = new Date().toISOString().slice(0, 10);
  // Only trips that haven't ended; pass just what the calculator needs
  const tours: CalcTourOption[] = rawTours
    .filter((x) => x.endDate >= today)
    .map((x) => localizeTour(x, locale))
    .map(({ id, title, price, days, kind, seats, startDate, endDate }) => ({ id, title, price, days, kind, seats, startDate, endDate }));

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.calculator}</span>
      </nav>
      <h1 className="page-title">{t.calc.title}</h1>
      <p className="page-lead">{t.calc.lead}</p>

      {tours.length ? (
        <Calculator tours={tours} settings={settings} initialTourId={Number(tour) || undefined} />
      ) : (
        <div className="empty">
          <strong>{t.list.emptyTitle}</strong>
        </div>
      )}

      <CurrencyConverter settings={settings} />
    </div>
  );
}
