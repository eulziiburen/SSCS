import type { MetadataRoute } from "next";
import { getHotels, getTours } from "@/lib/queries";
import { SITE_URL, languageAlternates } from "@/lib/site";

// Rebuilt hourly, so newly published tours and hotels show up without a redeploy.
export const revalidate = 3600;

const STATIC_PAGES = ["/", "/tours", "/hotels", "/calendar", "/mongolia", "/services", "/services/sim", "/calculator", "/plan"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, hotels] = await Promise.all([getTours(), getHotels()]);
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    alternates: { languages: languageAlternates(path) },
    priority,
  });
  return [
    ...STATIC_PAGES.map((p) => entry(p, p === "/" ? 1 : 0.7)),
    ...tours.map((t) => entry(`/tours/${t.id}`, 0.8)),
    ...hotels.map((h) => entry(`/hotels/${h.id}`, 0.6)),
  ];
}
