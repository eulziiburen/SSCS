import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotelBooking } from "@/components/HotelBooking";
import { HotelVisual } from "@/components/HotelCard";
import { CheckIcon, PinIcon } from "@/components/Icons";
import { fmt } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { localizeHotel, localizeRegion, starsLabel } from "@/lib/places";
import { getHotel, getRegion } from "@/lib/queries";

async function load(id: string) {
  const [{ locale, t }, raw] = await Promise.all([getI18n(), getHotel(Number(id))]);
  if (!raw?.published) return { t, hotel: undefined, region: undefined };
  const region = await getRegion(raw.regionCode);
  return { t, hotel: localizeHotel(raw, locale), region: region ? localizeRegion(region, locale) : undefined };
}

export async function generateMetadata({ params }: PageProps<"/hotels/[id]">): Promise<Metadata> {
  const { t, hotel } = await load((await params).id);
  if (!hotel) return {};
  return { title: hotel.name, description: `${t.hotels.category_[hotel.category]} · ${hotel.city} · ${fmt(hotel.pricePerNight)}` };
}

export default async function HotelPage({ params }: PageProps<"/hotels/[id]">) {
  const { t, hotel, region } = await load((await params).id);
  if (!hotel) notFound();
  const h = t.hotels;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="detail-hero">
        <HotelVisual hotel={hotel} />
        <div className="shade" />
        <div className="wrap txt">
          <nav className="crumbs light" aria-label={t.list.breadcrumb}>
            <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <Link href="/hotels">{t.nav.hotels}</Link>
          </nav>
          <span className="badge static">{h.category_[hotel.category]}</span>
          <h1>{hotel.name}</h1>
          {hotel.stars > 0 && (
            <span className="stars big" role="img" aria-label={`${hotel.stars}★`}>
              {starsLabel(hotel.stars)}
            </span>
          )}
        </div>
      </div>

      <div className="wrap detail">
        <div className="detail-main">
          <ul className="facts">
            <li>
              <PinIcon />{" "}
              <span>
                <small>{h.region}</small>
                {hotel.city}
                {region && region.name !== hotel.city ? `, ${region.name}` : ""}
              </span>
            </li>
            <li>
              <CheckIcon />{" "}
              <span>
                <small>{h.category}</small>
                {h.category_[hotel.category]}
              </span>
            </li>
          </ul>

          {hotel.description && <p className="hotel-desc">{hotel.description}</p>}

          {hotel.amenities.length > 0 && (
            <section aria-labelledby="am-h">
              <h2 id="am-h">{h.amenities}</h2>
              <ul className="amenity-list big">
                {hotel.amenities.map((a) => (
                  <li key={a}>
                    <CheckIcon className="yes" width={16} height={16} /> {h.amenity[a]}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {region && (
            <p>
              <Link className="more" href={`/mongolia?region=${region.code}`}>
                {h.seeOnMap}: {region.name} →
              </Link>
            </p>
          )}
        </div>

        <aside className="book-panel hotel-panel" aria-label={h.bookTitle}>
          <div className="price big">
            {fmt(hotel.pricePerNight)}
            <small>{h.perNight}</small>
          </div>
          <HotelBooking hotelId={hotel.id} price={hotel.pricePerNight} today={today} />
        </aside>
      </div>
    </>
  );
}
