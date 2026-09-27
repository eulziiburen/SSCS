import Link from "next/link";
import { fmt } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n";
import { starsLabel, type Hotel } from "@/lib/places";
import { imageUrl } from "./TourVisual";

// Uploaded photo, or a quiet placeholder so cards keep their shape before an admin adds one
export function HotelVisual({ hotel }: { hotel: Pick<Hotel, "imageId"> }) {
  if (hotel.imageId) {
    // eslint-disable-next-line @next/next/no-img-element -- served from our own /img route
    return <img className="art photo" src={imageUrl(hotel.imageId)} alt="" loading="lazy" decoding="async" />;
  }
  return (
    <svg className="art hotel-ph" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="250" />
      <path d="M150 165v-50h100v50M150 140h100M165 115v-15h30v15" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Expects an already-localized hotel (see localizeHotel)
export function HotelCard({ hotel, regionName, t }: { hotel: Hotel; regionName: string; t: Dictionary }) {
  return (
    <article className="card hotel-card">
      <div className="pic">
        <HotelVisual hotel={hotel} />
        <span className="badge static-top">{t.hotels.category_[hotel.category]}</span>
        <span className="country">
          {hotel.city}
          {regionName && regionName !== hotel.city ? ` · ${regionName}` : ""}
        </span>
      </div>
      <div className="body">
        <h3>
          <Link href={`/hotels/${hotel.id}`} className="stretch">
            {hotel.name}
          </Link>
        </h3>
        {hotel.stars > 0 && (
          <span className="stars" role="img" aria-label={`${hotel.stars}★`}>
            {starsLabel(hotel.stars)}
          </span>
        )}
        {hotel.amenities.length > 0 && (
          <ul className="amenity-list">
            {hotel.amenities.slice(0, 4).map((a) => (
              <li key={a}>{t.hotels.amenity[a]}</li>
            ))}
          </ul>
        )}
        <div className="foot">
          <div className="price">
            {fmt(hotel.pricePerNight)}
            <small>{t.hotels.perNight}</small>
          </div>
          <span className="btn sm ghost" aria-hidden="true">
            {t.hotels.details}
          </span>
        </div>
      </div>
    </article>
  );
}
