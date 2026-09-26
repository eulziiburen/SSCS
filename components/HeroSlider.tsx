"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmt, type SceneKey } from "@/lib/data";
import { ArrowIcon, ChevronIcon } from "./Icons";
import { useI18n } from "./LocaleProvider";
import { TourVisual } from "./TourVisual";

const INTERVAL = 6000;

export type Slide = { id: number; eyebrow: string; title: string; scene: SceneKey; imageId: number | null; route: string[]; price: number };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const { t } = useI18n();
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = (i: number) => setCur((i + n) % n);

  useEffect(() => {
    if (paused || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [cur, paused, n]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t.hero.label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="slides">
        {slides.map((s, i) => {
          return (
            <div key={s.id} className={`slide${i === cur ? " on" : ""}`} aria-hidden={i !== cur} aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>
              <TourVisual imageId={s.imageId} scene={s.scene} id={`h${i}`} priority={i === 0} />
              <div className="shade" />
              <div className="wrap txt">
                <span className="eyebrow">{s.eyebrow}</span>
                {i === 0 ? <h1>{s.title}</h1> : <h2 className="h1">{s.title}</h2>}
                <span className="route">{s.route.join(" → ")}</span>
                <div className="hero-cta">
                  <Link className="btn lg" href={`/tours/${s.id}`} tabIndex={i === cur ? 0 : -1}>
                    {t.hero.cta} <ArrowIcon />
                  </Link>
                  <span className="from">
                    <small>{t.hero.from}</small>
                    {fmt(s.price)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-ctrl wrap">
        <div className="dots">
          {slides.map((s, i) => (
            <button key={s.id} type="button" aria-label={s.title} aria-current={i === cur} className={i === cur ? "on" : ""} onClick={() => go(i)}>
              {i === cur && !paused && <span className="fill" style={{ animationDuration: `${INTERVAL}ms` }} />}
            </button>
          ))}
        </div>
        <div className="arrows">
          <button type="button" aria-label={t.hero.prev} onClick={() => go(cur - 1)}>
            <ChevronIcon style={{ transform: "scaleX(-1)" }} />
          </button>
          <button type="button" aria-label={t.hero.next} onClick={() => go(cur + 1)}>
            <ChevronIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
