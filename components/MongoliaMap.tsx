"use client";

import { useState } from "react";
import { MAP_VIEWBOX, REGION_SHAPES } from "@/lib/mongolia-map";

// Too small on the map for an in-place label; they still get a dot and appear in the list beside the map
const TINY = new Set(["orkhon", "darkhan-uul", "govisumber"]);
// Nudges for labels whose centroid collides with a neighbour's (Töv surrounds Ulaanbaatar)
const LABEL_OFFSET: Record<string, [number, number]> = { tuv: [12, 44] };

export function MongoliaMap({
  names,
  selected,
  onSelect,
  label,
}: {
  names: Record<string, string>;
  selected: string[];
  onSelect: (code: string) => void;
  label: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const hovered = hover ? names[hover] : null;

  return (
    <div className="mn-map">
      <svg viewBox={MAP_VIEWBOX} role="group" aria-label={label}>
        {REGION_SHAPES.map((r) => {
          const on = selected.includes(r.code);
          return (
            <path
              key={r.code}
              d={r.d}
              fillRule="evenodd"
              className={`mn-region${on ? " on" : ""}${hover === r.code ? " hover" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={names[r.code] ?? r.code}
              aria-pressed={on}
              onClick={() => onSelect(r.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(r.code);
                }
              }}
              onMouseEnter={() => setHover(r.code)}
              onMouseLeave={() => setHover((h) => (h === r.code ? null : h))}
              onFocus={() => setHover(r.code)}
              onBlur={() => setHover((h) => (h === r.code ? null : h))}
            />
          );
        })}
        {REGION_SHAPES.map((r) =>
          r.code === "ulaanbaatar" || TINY.has(r.code) ? (
            <g key={`l-${r.code}`} className="mn-dot" aria-hidden="true">
              <circle cx={r.cx} cy={r.cy} r={r.code === "ulaanbaatar" ? 6 : 4} />
              {r.code === "ulaanbaatar" && (
                <text x={r.cx} y={r.cy - 11}>
                  {names[r.code]}
                </text>
              )}
            </g>
          ) : (
            <text key={`l-${r.code}`} x={r.cx + (LABEL_OFFSET[r.code]?.[0] ?? 0)} y={r.cy + (LABEL_OFFSET[r.code]?.[1] ?? 0)} className={`mn-label${selected.includes(r.code) ? " on" : ""}`} aria-hidden="true">
              {names[r.code]}
            </text>
          ),
        )}
      </svg>
      <p className="mn-hover" aria-hidden="true">
        {hovered ?? " "}
      </p>
    </div>
  );
}
