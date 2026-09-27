import type { Metadata } from "next";
import Link from "next/link";
import { MapExplorer } from "@/components/MapExplorer";
import { getI18n } from "@/lib/locale";
import { localizeRegion } from "@/lib/places";
import { getHotels, getRegions } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.map.metaTitle, description: t.map.metaDescription };
}

export default async function MongoliaPage({ searchParams }: PageProps<"/mongolia">) {
  const [{ region }, { locale, t }, regions, hotels] = await Promise.all([searchParams, getI18n(), getRegions(), getHotels()]);
  const views = regions.map((r) => localizeRegion(r, locale)).sort((a, b) => a.name.localeCompare(b.name, locale));
  const hotelCounts: Record<string, number> = {};
  for (const h of hotels) hotelCounts[h.regionCode] = (hotelCounts[h.regionCode] ?? 0) + 1;

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.mongolia}</span>
      </nav>
      <h1 className="page-title">{t.map.title}</h1>
      <p className="page-lead">{t.map.lead}</p>
      <MapExplorer regions={views} hotelCounts={hotelCounts} initial={typeof region === "string" ? region : undefined} />
    </div>
  );
}
