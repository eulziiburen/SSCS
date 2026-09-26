import Link from "next/link";
import { VoucherButton } from "@/components/Booking";
import { HeroSlider } from "@/components/HeroSlider";
import { ArrowIcon } from "@/components/Icons";
import { SearchForm } from "@/components/SearchForm";
import { Tabs } from "@/components/Tabs";
import { TourCard } from "@/components/TourCard";
import { dotDate, fmt, localizeNews, localizeTour, VOUCHER_PRICE, type Kind } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { getHomeStats, getNews, getTours } from "@/lib/queries";

const KINDS: Kind[] = ["abroad", "local", "day"];

const SERVICE_ICONS = [
  <path key="sim" d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14.5 14.5 0 0 1 20 0M12 19.5h.01" />,
  <path key="stay" d="M3 20h18M5 20V11l7-6 7 6v9M10 20v-5h4v5" />,
  <path key="bus" d="M6 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2zM4 11h16M7 17v3M17 17v3M8 14h.01M16 14h.01" />,
  <path key="guide" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM15.5 8.5l-2 5-5 2 2-5z" />,
  <path key="photo" d="M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />,
];

export default async function Home() {
  const [{ locale, t }, rawTours, rawNews, stats] = await Promise.all([getI18n(), getTours(), getNews(), getHomeStats()]);
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
        </div>
        <div className="svc">
          {t.home.serviceList.map(([title, text], i) => (
            <article key={title}>
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {SERVICE_ICONS[i]}
                </svg>
              </div>
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
            <p>{t.home.reviewsLead}</p>
          </div>
        </div>
        <div className="revs">
          {t.home.reviewList.map(([name, trip, text]) => (
            <figure className="rev" key={name}>
              <span className="stars" role="img" aria-label={t.home.stars}>
                ★★★★★
              </span>
              <blockquote>{text}</blockquote>
              <figcaption className="who">
                <span className="av">{name[0]}</span>
                <div>
                  <strong>{name}</strong>
                  <small>{trip}</small>
                </div>
              </figcaption>
            </figure>
          ))}
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
