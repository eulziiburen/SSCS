import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { HotelCard } from "@/components/HotelCard";
import { fmt } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { filterHotels, HOTEL_CATEGORIES, localizeHotel, localizeRegion, type HotelFilter } from "@/lib/places";
import { getHotels, getRegions } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.hotels.metaTitle, description: t.hotels.metaDescription };
}

const PRICE_STEPS = [100000, 200000, 350000, 500000];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function HotelsPage({ searchParams }: PageProps<"/hotels">) {
  const [sp, { locale, t }, hotels, regions] = await Promise.all([searchParams, getI18n(), getHotels(), getRegions()]);
  const h = t.hotels;
  const f: HotelFilter = { region: one(sp.region), category: one(sp.category), stars: one(sp.stars), price: one(sp.price), sort: one(sp.sort) };
  const regionName = Object.fromEntries(regions.map((r) => [r.code, localizeRegion(r, locale).name]));
  // Only offer provinces that actually have a place listed
  const withHotels = regions.filter((r) => hotels.some((x) => x.regionCode === r.code)).map((r) => localizeRegion(r, locale));
  const list = filterHotels(hotels, f).map((x) => localizeHotel(x, locale));

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.nav.hotels}</span>
      </nav>
      <h1 className="page-title">{h.title}</h1>
      <p className="page-lead">{h.lead}</p>

      <Form action="/hotels" className="search-form compact hotel-filter">
        <div className="field">
          <label htmlFor="hf-region">{h.region}</label>
          <select id="hf-region" name="region" defaultValue={f.region ?? ""}>
            <option value="">{h.anyRegion}</option>
            {withHotels.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hf-category">{h.category}</label>
          <select id="hf-category" name="category" defaultValue={f.category ?? ""}>
            <option value="">{h.anyCategory}</option>
            {HOTEL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {h.category_[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hf-stars">{h.stars}</label>
          <select id="hf-stars" name="stars" defaultValue={f.stars ?? ""}>
            <option value="">{h.anyStars}</option>
            {[3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {h.starsMin(n)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hf-price">{h.price}</label>
          <select id="hf-price" name="price" defaultValue={f.price ?? ""}>
            <option value="">{h.anyPrice}</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                {h.priceUpTo(fmt(p))}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hf-sort">{t.list.sort}</label>
          <select id="hf-sort" name="sort" defaultValue={f.sort ?? ""}>
            <option value="">{h.sortCheap}</option>
            <option value="price-desc">{h.sortExpensive}</option>
            <option value="stars">{h.sortStars}</option>
          </select>
        </div>
        <button className="btn search-btn" type="submit">
          {h.filter}
        </button>
      </Form>

      <div className="result-bar" aria-live="polite">
        <strong>{h.found(list.length)}</strong>
        {Object.values(f).some(Boolean) && (
          <Link className="clear" href="/hotels">
            {t.list.clearAll}
          </Link>
        )}
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((x) => (
            <HotelCard key={x.id} hotel={x} regionName={regionName[x.regionCode] ?? ""} t={t} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>{h.empty}</p>
          <a className="btn" href="tel:+97670000000">
            {t.tour.call}
          </a>
        </div>
      )}
    </div>
  );
}
