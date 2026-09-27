"use client";

import Link from "next/link";
import { useState } from "react";
import type { RegionView } from "@/lib/places";
import { useI18n } from "./LocaleProvider";
import { MongoliaMap } from "./MongoliaMap";
import { imageUrl } from "./TourVisual";

export function MapExplorer({ regions, hotelCounts, initial }: { regions: RegionView[]; hotelCounts: Record<string, number>; initial?: string }) {
  const { t } = useI18n();
  const m = t.map;
  const [code, setCode] = useState<string | null>(regions.some((r) => r.code === initial) ? initial! : null);
  const region = regions.find((r) => r.code === code);
  const names = Object.fromEntries(regions.map((r) => [r.code, r.name]));

  function pick(next: string) {
    setCode(next);
    // Shareable URL without a history entry per click
    const url = new URL(window.location.href);
    url.searchParams.set("region", next);
    window.history.replaceState(null, "", url);
    // On narrow screens the panel sits below the map; bring it into view
    if (window.matchMedia("(max-width: 960px)").matches) document.getElementById("region-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="explore">
      <div className="explore-map">
        <MongoliaMap names={names} selected={code ? [code] : []} onSelect={pick} label={m.listLabel} />
        <p className="fine map-attr">{m.attribution}</p>
        <div className="chips region-chips" role="list" aria-label={m.listLabel}>
          {regions.map((r) => (
            <button key={r.code} role="listitem" type="button" className="chip" aria-pressed={r.code === code} onClick={() => pick(r.code)}>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <section id="region-panel" className="region-panel" aria-live="polite">
        {region ? (
          <>
            {region.imageId && (
              // eslint-disable-next-line @next/next/no-img-element -- served from our own /img route
              <img className="region-photo" src={imageUrl(region.imageId)} alt="" />
            )}
            <h2>{region.name}</h2>
            <p className="region-center">
              {m.center}: {region.center}
            </p>
            <p className="region-summary">{region.summary}</p>
            <h3>{m.history}</h3>
            <p>{region.history}</p>
            <h3>{m.culture}</h3>
            <p>{region.culture}</p>
            {region.attractions.length > 0 && (
              <>
                <h3>{m.attractions}</h3>
                <ul className="region-sights">
                  {region.attractions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="region-actions">
              <Link className="btn" href={`/plan?regions=${region.code}`}>
                {m.planHere}
              </Link>
              {(hotelCounts[region.code] ?? 0) > 0 && (
                <Link className="btn ghost" href={`/hotels?region=${region.code}`}>
                  {m.hotelsHere(hotelCounts[region.code])}
                </Link>
              )}
            </div>
          </>
        ) : (
          <p className="region-empty">{m.pick}</p>
        )}
      </section>
    </div>
  );
}
