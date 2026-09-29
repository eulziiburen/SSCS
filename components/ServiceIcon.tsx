import type { ServiceKey } from "@/lib/services";

// White line art drawn for Soft Travel, set on a per-service gradient tile (colours in globals.css .svc-icon.s-*)
const PATHS: Record<ServiceKey, React.ReactNode> = {
  // SIM card with a chip and a signal arc
  sim: (
    <>
      <path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <rect x="8" y="11" width="7" height="6" rx="1" />
      <path d="M11.5 11v6M8 14h7" />
      <path d="M9 6.5a4 4 0 0 1 4 0" />
    </>
  ),
  // ger / tent with a door flap and the sky line
  stay: (
    <>
      <path d="M3 19 12 5l9 14" />
      <path d="M2 19h20" />
      <path d="M12 12l-3 7M12 12l3 7" />
      <path d="M17 5.5h.01M19.5 8h.01" />
    </>
  ),
  // bus, front view
  bus: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <path d="M4 11h16M8 7h8" />
      <path d="M7.5 14.5h.01M16.5 14.5h.01" />
      <path d="M7 18v2.5M17 18v2.5" />
    </>
  ),
  // compass with a needle and cardinal ticks
  guide: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5l2.1-4.9z" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </>
  ),
  // camera with a lens ring
  photo: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M18 10.5h.01" />
    </>
  ),
};

export function ServiceIcon({ service, size = 36 }: { service: ServiceKey; size?: number }) {
  return (
    <span className={`svc-icon s-${service}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[service]}
      </svg>
    </span>
  );
}
