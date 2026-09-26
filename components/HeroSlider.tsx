"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmt, SLIDES, tourById } from "@/lib/data";
import { ArrowIcon, ChevronIcon } from "./Icons";
import { SceneArt } from "./SceneArt";

const INTERVAL = 6000;

export function HeroSlider() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = SLIDES.length;
  const go = (i: number) => setCur((i + n) % n);

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [cur, paused, n]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Онцлох аялал"
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
        {SLIDES.map((s, i) => {
          const t = tourById(s.id)!;
          return (
            <div key={s.id} className={`slide${i === cur ? " on" : ""}`} aria-hidden={i !== cur} aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>
              <SceneArt scene={t.scene} id={`h${i}`} />
              <div className="shade" />
              <div className="wrap txt">
                <span className="eyebrow">{s.eyebrow}</span>
                {i === 0 ? <h1>{s.title}</h1> : <h2 className="h1">{s.title}</h2>}
                <span className="route">{t.route.join(" → ")}</span>
                <div className="hero-cta">
                  <Link className="btn lg" href={`/tours/${t.id}`} tabIndex={i === cur ? 0 : -1}>
                    Хөтөлбөр үзэх <ArrowIcon />
                  </Link>
                  <span className="from">
                    <small>эхлэх үнэ</small>
                    {fmt(t.price)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-ctrl wrap">
        <div className="dots">
          {SLIDES.map((s, i) => (
            <button key={s.id} type="button" aria-label={s.title} aria-current={i === cur} className={i === cur ? "on" : ""} onClick={() => go(i)}>
              {i === cur && !paused && <span className="fill" style={{ animationDuration: `${INTERVAL}ms` }} />}
            </button>
          ))}
        </div>
        <div className="arrows">
          <button type="button" aria-label="Өмнөх" onClick={() => go(cur - 1)}>
            <ChevronIcon style={{ transform: "scaleX(-1)" }} />
          </button>
          <button type="button" aria-label="Дараах" onClick={() => go(cur + 1)}>
            <ChevronIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
