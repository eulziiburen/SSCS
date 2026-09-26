import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookButton } from "@/components/Booking";
import { CalendarIcon, CheckIcon, ClockIcon, PhoneIcon, PinIcon, SeatIcon, XIcon } from "@/components/Icons";
import { SceneArt } from "@/components/SceneArt";
import { TourCard } from "@/components/TourCard";
import { dateRange, daysLabel, EXCLUDES, fmt, INCLUDES, KIND_LABEL } from "@/lib/data";
import { getTour, getTours } from "@/lib/queries";

export async function generateStaticParams() {
  return (await getTours()).map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({ params }: PageProps<"/tours/[id]">): Promise<Metadata> {
  const tour = await getTour(Number((await params).id));
  if (!tour?.published) return {};
  return { title: tour.title, description: `${tour.country} · ${dateRange(tour)} · ${daysLabel(tour)} · ${fmt(tour.price)}-өөс` };
}

export default async function TourPage({ params }: PageProps<"/tours/[id]">) {
  const tour = await getTour(Number((await params).id));
  if (!tour?.published) notFound();

  const related = (await getTours()).filter((t) => t.kind === tour.kind && t.id !== tour.id).slice(0, 3);
  const low = tour.seats <= 3;

  return (
    <>
      <div className="detail-hero">
        <SceneArt scene={tour.scene} id="d" />
        <div className="shade" />
        <div className="wrap txt">
          <nav className="crumbs light" aria-label="Байршил">
            <Link href="/">Нүүр</Link> <span aria-hidden="true">/</span> <Link href={`/tours?kind=${tour.kind}`}>{KIND_LABEL[tour.kind]}</Link>
          </nav>
          {tour.badge && <span className={`badge static${tour.hot ? " hot" : ""}`}>{tour.badge}</span>}
          <h1>{tour.title}</h1>
          <span className="route">{tour.route.join(" → ")}</span>
        </div>
      </div>

      <div className="wrap detail">
        <div className="detail-main">
          <ul className="facts">
            <li>
              <PinIcon /> <span><small>Чиглэл</small>{tour.country}</span>
            </li>
            <li>
              <CalendarIcon /> <span><small>Огноо</small>{dateRange(tour)}</span>
            </li>
            <li>
              <ClockIcon /> <span><small>Хугацаа</small>{daysLabel(tour)}</span>
            </li>
            <li className={low ? "low" : undefined}>
              <SeatIcon /> <span><small>Үлдэгдэл</small>{tour.seats} суудал</span>
            </li>
          </ul>

          <section aria-labelledby="route-h">
            <h2 id="route-h">Аяллын маршрут</h2>
            <ol className="timeline">
              {tour.route.map((stop, i) => (
                <li key={i}>
                  <span className="dot" aria-hidden="true" />
                  <strong>{stop}</strong>
                  <small>{i === 0 ? "Хөдлөх" : i === tour.route.length - 1 ? "Буцаж ирэх" : `${i}-р зогсоол`}</small>
                </li>
              ))}
            </ol>
          </section>

          <section className="incl" aria-label="Үнэд багтсан эсэх">
            <div>
              <h2>Үнэд багтсан</h2>
              <ul>
                {INCLUDES[tour.kind].map((x) => (
                  <li key={x}>
                    <CheckIcon className="yes" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2>Багтаагүй</h2>
              <ul>
                {EXCLUDES[tour.kind].map((x) => (
                  <li key={x}>
                    <XIcon className="no" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <aside className="book-panel" aria-label="Захиалга">
          <div className="price big">
            {fmt(tour.price)}
            <small>1 хүний үнэ</small>
          </div>
          {low && <p className="urgent">Сүүлийн {tour.seats} суудал үлдлээ</p>}
          <BookButton tour={tour} className="btn lg full">
            Захиалах
          </BookButton>
          <a className="btn ghost full" href="tel:+97670000000">
            <PhoneIcon /> Утсаар лавлах
          </a>
          <p className="fine">Одоо төлбөр төлөхгүй. Менежер ажлын 1 өдрийн дотор холбогдоно.</p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="block wrap" aria-labelledby="rel-h">
          <div className="head">
            <h2 id="rel-h">Төстэй аяллууд</h2>
          </div>
          <div className="grid">
            {related.map((t) => (
              <TourCard key={t.id} tour={t} idPrefix="r" />
            ))}
          </div>
        </section>
      )}

      <div className="mobile-book">
        <div className="price">
          {fmt(tour.price)}
          <small>1 хүний үнэ</small>
        </div>
        <BookButton tour={tour}>Захиалах</BookButton>
      </div>
    </>
  );
}
