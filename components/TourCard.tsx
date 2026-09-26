import Link from "next/link";
import { dateRange, fmt, type Tour } from "@/lib/data";
import { BookButton } from "./Booking";
import { CalendarIcon, ClockIcon, SeatIcon } from "./Icons";
import { SceneArt } from "./SceneArt";

export function TourCard({ tour, idPrefix = "c" }: { tour: Tour; idPrefix?: string }) {
  const low = tour.seats <= 3;
  return (
    <article className="card">
      <div className="pic">
        <SceneArt scene={tour.scene} id={`${idPrefix}${tour.id}`} />
        {tour.badge && <span className={`badge${tour.hot ? " hot" : ""}`}>{tour.badge}</span>}
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
            <ClockIcon width={15} height={15} /> {tour.days} өдөр
          </span>
          <span className={low ? "low" : undefined}>
            <SeatIcon width={15} height={15} /> {low ? `Сүүлийн ${tour.seats} суудал` : `${tour.seats} суудал`}
          </span>
        </div>
        <div className="foot">
          <div className="price">
            {fmt(tour.price)}
            <small>1 хүний үнэ</small>
          </div>
          <BookButton tourId={tour.id} className="btn sm raise">
            Захиалах
          </BookButton>
        </div>
      </div>
    </article>
  );
}
