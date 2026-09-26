import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookButton } from "@/components/Booking";
import { CalendarIcon, CheckIcon, ClockIcon, PhoneIcon, PinIcon, SeatIcon, XIcon } from "@/components/Icons";
import { TourVisual } from "@/components/TourVisual";
import { TourCard } from "@/components/TourCard";
import { dateRange, fmt, localizeTour } from "@/lib/data";
import { badgeLabel } from "@/lib/i18n";
import { getI18n } from "@/lib/locale";
import { getTour, getTours } from "@/lib/queries";

// Pages depend on the visitor's language (cookie), so they render per request rather than at build time

async function load(id: string) {
  const [{ locale, t }, raw] = await Promise.all([getI18n(), getTour(Number(id))]);
  return { locale, t, tour: raw?.published ? localizeTour(raw, locale) : undefined };
}

export async function generateMetadata({ params }: PageProps<"/tours/[id]">): Promise<Metadata> {
  const { t, tour } = await load((await params).id);
  if (!tour) return {};
  return { title: tour.title, description: `${tour.country} · ${dateRange(tour)} · ${t.tour.daysNights(tour.days)} · ${fmt(tour.price)}` };
}

export default async function TourPage({ params }: PageProps<"/tours/[id]">) {
  const { locale, t, tour } = await load((await params).id);
  if (!tour) notFound();

  const related = (await getTours())
    .filter((x) => x.kind === tour.kind && x.id !== tour.id)
    .slice(0, 3)
    .map((x) => localizeTour(x, locale));
  const low = tour.seats <= 3;

  return (
    <>
      <div className="detail-hero">
        <TourVisual imageId={tour.imageId} scene={tour.scene} id="d" priority />
        <div className="shade" />
        <div className="wrap txt">
          <nav className="crumbs light" aria-label={t.list.breadcrumb}>
            <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <Link href={`/tours?kind=${tour.kind}`}>{t.kind[tour.kind]}</Link>
          </nav>
          {tour.badge && <span className={`badge static${tour.hot ? " hot" : ""}`}>{badgeLabel(tour.badge, locale)}</span>}
          <h1>{tour.title}</h1>
          <span className="route">{tour.route.join(" → ")}</span>
        </div>
      </div>

      <div className="wrap detail">
        <div className="detail-main">
          <ul className="facts">
            <li>
              <PinIcon /> <span><small>{t.tour.destination}</small>{tour.country}</span>
            </li>
            <li>
              <CalendarIcon /> <span><small>{t.tour.dates}</small>{dateRange(tour)}</span>
            </li>
            <li>
              <ClockIcon /> <span><small>{t.tour.duration}</small>{t.tour.daysNights(tour.days)}</span>
            </li>
            <li className={low ? "low" : undefined}>
              <SeatIcon /> <span><small>{t.tour.remaining}</small>{t.card.seats(tour.seats)}</span>
            </li>
          </ul>

          <section aria-labelledby="route-h">
            <h2 id="route-h">{t.tour.route}</h2>
            <ol className="timeline">
              {tour.route.map((stop, i) => (
                <li key={i}>
                  <span className="dot" aria-hidden="true" />
                  <strong>{stop}</strong>
                  <small>{i === 0 ? t.tour.depart : i === tour.route.length - 1 ? t.tour.returnHome : t.tour.stop(i)}</small>
                </li>
              ))}
            </ol>
          </section>

          <section className="incl" aria-label={t.tour.inclusion}>
            <div>
              <h2>{t.tour.included}</h2>
              <ul>
                {t.tour.includes[tour.kind].map((x) => (
                  <li key={x}>
                    <CheckIcon className="yes" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{t.tour.excluded}</h2>
              <ul>
                {t.tour.excludes[tour.kind].map((x) => (
                  <li key={x}>
                    <XIcon className="no" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <aside className="book-panel" aria-label={t.tour.booking}>
          <div className="price big">
            {fmt(tour.price)}
            <small>{t.card.perPerson}</small>
          </div>
          {low && <p className="urgent">{t.tour.lastSeatsLeft(tour.seats)}</p>}
          <BookButton tour={tour} className="btn lg full">
            {t.card.book}
          </BookButton>
          <Link className="btn ghost full" href={`/calculator?tour=${tour.id}`}>
            {t.tour.calculate}
          </Link>
          <a className="btn ghost full" href="tel:+97670000000">
            <PhoneIcon /> {t.tour.call}
          </a>
          <p className="fine">{t.tour.noPayment}</p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="block wrap" aria-labelledby="rel-h">
          <div className="head">
            <h2 id="rel-h">{t.tour.related}</h2>
          </div>
          <div className="grid">
            {related.map((x) => (
              <TourCard key={x.id} tour={x} idPrefix="r" />
            ))}
          </div>
        </section>
      )}

      <div className="mobile-book">
        <div className="price">
          {fmt(tour.price)}
          <small>{t.card.perPerson}</small>
        </div>
        <BookButton tour={tour}>{t.card.book}</BookButton>
      </div>
    </>
  );
}
