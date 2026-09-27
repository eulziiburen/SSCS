import type { Metadata } from "next";
import Link from "next/link";
import { TripPlanner, type PlannerHotel } from "@/components/TripPlanner";
import { getI18n } from "@/lib/locale";
import { localizeHotel, localizeRegion } from "@/lib/places";
import { getHotels, getRegions } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.plan.metaTitle, description: t.plan.metaDescription };
}

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const [{ regions: pre }, { locale, t }, regions, hotels] = await Promise.all([searchParams, getI18n(), getRegions(), getHotels()]);
  const views = regions.map((r) => localizeRegion(r, locale)).sort((a, b) => a.name.localeCompare(b.name, locale));
  const plannerHotels: PlannerHotel[] = hotels.map((h) => {
    const l = localizeHotel(h, locale);
    return { id: l.id, name: l.name, regionCode: l.regionCode, city: l.city, stars: l.stars, category: l.category, pricePerNight: l.pricePerNight };
  });
  const initial = typeof pre === "string" ? pre.split(",") : [];

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.plan}</span>
      </nav>
      <h1 className="page-title">{t.plan.title}</h1>
      <p className="page-lead">{t.plan.lead}</p>
      <TripPlanner regions={views} hotels={plannerHotels} initialRegions={initial} today={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
