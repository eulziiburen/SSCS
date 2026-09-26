import Link from "next/link";
import { VoucherButton } from "@/components/Booking";
import { HeroSlider } from "@/components/HeroSlider";
import { ArrowIcon } from "@/components/Icons";
import { SearchForm } from "@/components/SearchForm";
import { Tabs } from "@/components/Tabs";
import { TourCard } from "@/components/TourCard";
import { dotDate, fmt, KIND_LABEL, REVIEWS, VOUCHER_PRICE, type Kind } from "@/lib/data";
import { getNews, getTours } from "@/lib/queries";

const KINDS: Kind[] = ["abroad", "local", "day"];

const SERVICES = [
  { title: "Дата сим", text: "Гадаадад интернэтээс тасрахгүй. 40 гаруй улсад ажиллана.", icon: <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14.5 14.5 0 0 1 20 0M12 19.5h.01" /> },
  { title: "Байрлах газар", text: "Зочид буудал, жуулчны бааз, гэр кемпүүдийг захиалах.", icon: <path d="M3 20h18M5 20V11l7-6 7 6v9M10 20v-5h4v5" /> },
  { title: "Автобус түрээс", text: "Өдрийн болон олон хоногийн түрээс, 15–45 суудалтай.", icon: <path d="M6 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2zM4 11h16M7 17v3M17 17v3M8 14h.01M16 14h.01" /> },
  { title: "Хөтөч", text: "Монгол, англи, хятад хэлтэй мэргэжлийн хөтөч.", icon: <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM15.5 8.5l-2 5-5 2 2-5z" /> },
  { title: "Зурагчин", text: "Аяллын дурсамжаа мэргэжлийн зурагчнаар мөнхлөөрэй.", icon: <path d="M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" /> },
];

const STATS = [
  { v: "12+", l: "жил туршлага" },
  { v: "18,000+", l: "аялагч" },
  { v: "4.9 / 5", l: "дундаж үнэлгээ" },
  { v: "24/7", l: "аяллын үеийн дэмжлэг" },
];

export default async function Home() {
  const [tours, news] = await Promise.all([getTours(), getNews()]);
  const upcoming = tours.filter((t) => t.upcoming);
  // Fall back to the soonest tours so the hero is never empty
  const heroTours = tours.some((t) => t.featured) ? tours.filter((t) => t.featured) : tours.slice(0, 4);
  const slides = heroTours.map((t) => ({
    id: t.id,
    eyebrow: t.heroEyebrow || `${KIND_LABEL[t.kind]} · ${t.days} өдөр`,
    title: t.title,
    scene: t.scene,
    route: t.route,
    price: t.price,
  }));

  return (
    <>
      {slides.length > 0 && <HeroSlider slides={slides} />}

      <div className="wrap search-float">
        <SearchForm />
      </div>

      <section className="wrap stats" aria-label="Бидний тухай тоогоор">
        {STATS.map((s) => (
          <div key={s.l}>
            <strong>{s.v}</strong>
            <span>{s.l}</span>
          </div>
        ))}
      </section>

      <section className="block wrap" id="tours" aria-labelledby="tours-h">
        <div className="head">
          <div>
            <h2 id="tours-h">Эрэлттэй аялал</h2>
            <p>Аялагчдын хамгийн их үзэж буй хөтөлбөрүүд.</p>
          </div>
          <Link className="more" href="/tours">
            Бүх аялал <ArrowIcon />
          </Link>
        </div>
        <Tabs
          label="Аяллын төрөл"
          tabs={KINDS.map((k) => ({
            key: k,
            label: KIND_LABEL[k],
            content: (
              <div className="grid">
                {tours
                  .filter((t) => t.kind === k)
                  .slice(0, 4)
                  .map((t) => (
                    <TourCard key={t.id} tour={t} idPrefix={`p${k}`} />
                  ))}
              </div>
            ),
          }))}
        />
      </section>

      <section className="block wrap" id="upcoming" aria-labelledby="up-h">
        <div className="head">
          <div>
            <h2 id="up-h">Ойрын хугацаанд гарах аяллууд</h2>
            <p>Энэ улирлын онцлох багц аяллууд. Суудал хязгаартай тул эрт захиалаарай.</p>
          </div>
        </div>
        <div className="grid">
          {upcoming.map((t) => (
            <TourCard key={t.id} tour={t} idPrefix="u" />
          ))}
        </div>

        <div className="voucher">
          <div className="v-txt">
            <span className="eyebrow">Бэлгийн карт</span>
            <h2>Аяллын эрхийн бичиг бэлэглээрэй</h2>
            <p>Хайртай хүндээ мартагдашгүй бэлэг барь. Тодорхой аяллын нэрээр эсвэл өөрийн сонгосон дүнгээр эрхийн бичиг захиалах боломжтой. Хүчинтэй хугацаа 12 сар.</p>
            <VoucherButton>Эрхийн бичиг захиалах</VoucherButton>
          </div>
          <div className="ticket" aria-hidden="true">
            <span className="t-l">Аяллын эрхийн бичиг</span>
            <span className="t-v">{fmt(VOUCHER_PRICE)}</span>
            <span className="t-n">№ ST-2026-0418 · 2027.09.26 хүртэл</span>
          </div>
        </div>
      </section>

      <section className="block wrap" id="services" aria-labelledby="svc-h">
        <div className="head">
          <div>
            <h2 id="svc-h">Нэмэлт үйлчилгээ</h2>
            <p>Аяллаа бүрэн болгох үйлчилгээнүүдийг онлайнаар захиалаарай.</p>
          </div>
        </div>
        <div className="svc">
          {SERVICES.map((s) => (
            <article key={s.title}>
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {s.icon}
                </svg>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block wrap" id="reviews" aria-labelledby="rev-h">
        <div className="head">
          <div>
            <h2 id="rev-h">Аялагчдын сэтгэгдэл</h2>
            <p>Бидэнтэй аялсан хүмүүсийн үнэлгээ. Дундаж 4.9 / 5, 1,240 сэтгэгдэл.</p>
          </div>
        </div>
        <div className="revs">
          {REVIEWS.map((r) => (
            <figure className="rev" key={r.name}>
              <span className="stars" role="img" aria-label="5 од">
                ★★★★★
              </span>
              <blockquote>{r.text}</blockquote>
              <figcaption className="who">
                <span className="av">{r.name[0]}</span>
                <div>
                  <strong>{r.name}</strong>
                  <small>{r.trip}</small>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="block wrap" id="news" aria-labelledby="news-h">
        <div className="head">
          <div>
            <h2 id="news-h">Мэдээ мэдээлэл</h2>
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
