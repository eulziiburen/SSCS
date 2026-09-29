import Link from "next/link";
import { VoucherButton } from "@/components/Booking";
import { HeroSlider } from "@/components/HeroSlider";
import { ReviewButton } from "@/components/ReviewForm";
import { ArrowIcon } from "@/components/Icons";
import { SearchForm } from "@/components/SearchForm";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Tabs } from "@/components/Tabs";
import { TourCard } from "@/components/TourCard";
import { dotDate, fmt, localizeNews, localizeTour, VOUCHER_PRICE, type Kind } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { SERVICE_KEYS } from "@/lib/services";
import { getHomeStats, getNews, getReviews, getTours } from "@/lib/queries";

const KINDS: Kind[] = ["abroad", "local", "day"];

export default async function Home() {
  const [{ locale, t }, rawTours, rawNews, stats, approved] = await Promise.all([getI18n(), getTours(), getNews(), getHomeStats(), getReviews()]);
  // Until travelers have posted their own, the original sample reviews keep the section from looking empty
  const reviews = approved.length
    ? approved.slice(0, 6).map((r) => ({ key: String(r.id), name: r.name, trip: r.trip ?? "", text: r.text, rating: r.rating }))
    : t.home.reviewList.map(([name, trip, text]) => ({ key: name, name, trip, text, rating: 5 }));
  const reviewsLead = approved.length
    ? t.review.lead2((approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1), approved.length)
    : t.home.reviewsLead;
  const tours = rawTours.map((x) => localizeTour(x, locale));
  const news = rawNews.map((x) => localizeNews(x, locale));
  const upcoming = tours.filter((x) => x.upcoming);
  // Fall back to the soonest tours so the hero is never empty
  const heroTours = tours.some((x) => x.featured) ? tours.filter((x) => x.featured) : tours.slice(0, 4);
  const slides = heroTours.map((x) => ({
    id: x.id,
    eyebrow: x.heroEyebrow || t.hero.eyebrow(t.kind[x.kind], x.days),
    title: x.title,
    scene: x.scene,
    imageId: x.imageId,
    route: x.route,
    price: x.price,
  }));

  return (
    <>
      {slides.length > 0 && <HeroSlider slides={slides} />}

      <div className="wrap search-float">
        <SearchForm />
      </div>

      {stats.length > 0 && (
        <section className="wrap stats" aria-label={t.stats.label} style={{ "--n": stats.length } as React.CSSProperties}>
          {stats.map((s, i) => (
            <div key={i}>
              <strong>{s.value}</strong>
              <span>{(locale === "en" ? s.en : s.mn) || s.mn || s.en}</span>
            </div>
          ))}
        </section>
      )}

      <section className="block wrap" id="tours" aria-labelledby="tours-h">
        <div className="head">
          <div>
            <h2 id="tours-h">{t.home.popular}</h2>
            <p>{t.home.popularLead}</p>
          </div>
          <Link className="more" href="/tours">
            {t.home.allTours} <ArrowIcon />
          </Link>
        </div>
        <Tabs
          label={t.home.tourKinds}
          tabs={KINDS.map((k) => ({
            key: k,
            label: t.kind[k],
            content: (
              <div className="grid">
                {tours
                  .filter((x) => x.kind === k)
                  .slice(0, 4)
                  .map((x) => (
                    <TourCard key={x.id} tour={x} idPrefix={`p${k}`} />
                  ))}
              </div>
            ),
          }))}
        />
      </section>

      <section className="block wrap" id="upcoming" aria-labelledby="up-h">
        <div className="head">
          <div>
            <h2 id="up-h">{t.home.upcoming}</h2>
            <p>{t.home.upcomingLead}</p>
          </div>
        </div>
        <div className="grid">
          {upcoming.map((x) => (
            <TourCard key={x.id} tour={x} idPrefix="u" />
          ))}
        </div>

        <div className="voucher">
          <div className="v-txt">
            <span className="eyebrow">{t.home.voucherEyebrow}</span>
            <h2>{t.home.voucherTitle}</h2>
            <p>{t.home.voucherText}</p>
            <VoucherButton>{t.home.voucherCta}</VoucherButton>
          </div>
          <div className="ticket" aria-hidden="true">
            <span className="t-l">{t.home.voucherTicket}</span>
            <span className="t-v">{fmt(VOUCHER_PRICE)}</span>
            <span className="t-n">№ ST-2026-0418 · {t.home.voucherValid}</span>
          </div>
        </div>
      </section>

      <section className="block wrap" id="services" aria-labelledby="svc-h">
        <div className="head">
          <div>
            <h2 id="svc-h">{t.home.services}</h2>
            <p>{t.home.servicesLead}</p>
          </div>
          <Link className="more" href="/services">
            {t.svc.request} <ArrowIcon />
          </Link>
        </div>
        <div className="svc">
          {t.home.serviceList.map(([title, text], i) => (
            <article key={title}>
              <ServiceIcon service={SERVICE_KEYS[i]} size={44} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block wrap" id="reviews" aria-labelledby="rev-h">
        <div className="head">
          <div>
            <h2 id="rev-h">{t.home.reviews}</h2>
            <p>{reviewsLead}</p>
          </div>
        </div>
        <div className="revs">
          {reviews.map(({ key, name, trip, text, rating }) => (
            <figure className="rev" key={key}>
              <span className="stars" role="img" aria-label={t.review.ratingLabel(rating)}>
                {"★".repeat(rating)}
                <span className="off">{"★".repeat(5 - rating)}</span>
              </span>
              <blockquote>{text}</blockquote>
              <figcaption className="who">
                <span className="av">{name[0]}</span>
                <div>
                  <strong>{name}</strong>
                  {trip && <small>{trip}</small>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="revs-foot">
          <ReviewButton />
        </div>
      </section>

      <section className="block wrap" id="news" aria-labelledby="news-h">
        <div className="head">
          <div>
            <h2 id="news-h">{t.home.news}</h2>
          </div>
        </div>
        <div className="news">
          {news.slice(0, 6).map((n) => (
            <article key={n.id}>
              <time dateTime={n.date}>{dotDate(n.date)}</time>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
