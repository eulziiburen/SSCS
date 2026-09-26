import Link from "next/link";
import { dateRange, fmt, type Tour } from "@/lib/data";
import { badgeLabel } from "@/lib/i18n";
import { getI18n } from "@/lib/locale";
import { BookButton } from "./Booking";
import { CalendarIcon, ClockIcon, SeatIcon } from "./Icons";
import { SceneArt } from "./SceneArt";

// Expects an already-localized tour (see localizeTour)
export async function TourCard({ tour, idPrefix = "c" }: { tour: Tour; idPrefix?: string }) {
  const { locale, t } = await getI18n();
  const low = tour.seats <= 3;
  return (
    <article className="card">
      <div className="pic">
        <SceneArt scene={tour.scene} id={`${idPrefix}${tour.id}`} />
        {tour.badge && <span className={`badge${tour.hot ? " hot" : ""}`}>{badgeLabel(tour.badge, locale)}</span>}
        <span className="country">{tour.country}</span>
      </div>
      <div className="body">
        <h3>
          <Link href={`/tours/${tour.id}`} className="stretch">
            {tour.title}
          </Link>
        </h3>
        <div className="meta">
          <span>
            <CalendarIcon width={15} height={15} /> {dateRange(tour)}
          </span>
          <span>
            <ClockIcon width={15} height={15} /> {t.card.days(tour.days)}
          </span>
          <span className={low ? "low" : undefined}>
            <SeatIcon width={15} height={15} /> {low ? t.card.lastSeats(tour.seats) : t.card.seats(tour.seats)}
          </span>
        </div>
        <div className="foot">
          <div className="price">
            {fmt(tour.price)}
            <small>{t.card.perPerson}</small>
          </div>
          <BookButton tour={tour} className="btn sm raise">
            {t.card.book}
          </BookButton>
        </div>
      </div>
    </article>
  );
}
