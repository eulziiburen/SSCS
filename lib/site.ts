// Canonical origin for sitemap, Open Graph and structured data (sscs.mn also serves the site,
// but www is the address everything links to).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sscs.mn").replace(/\/$/, "");
export const SITE_NAME = "Soft Travel";

// Same page in English: the proxy turns ?lang=en into the English locale.
export const enUrl = (path: string) => `${SITE_URL}${path}${path.includes("?") ? "&" : "?"}lang=en`;

// hreflang pair for a page, for metadata `alternates.languages` and the sitemap.
export const languageAlternates = (path: string) => ({ mn: `${SITE_URL}${path}`, en: enUrl(path) });

// Share card used when a page has no photo of its own (public/brand/og.png, 1200×630).
export const DEFAULT_OG_IMAGE = { url: "/brand/og.png", width: 1200, height: 630, alt: SITE_NAME };

// Open Graph for a page. Next replaces the parent's openGraph object rather than merging it,
// so every page passes the site-wide fields again through here.
export function openGraph({ title, description, imageId, locale }: { title?: string; description?: string; imageId?: number | null; locale: string }) {
  return {
    siteName: SITE_NAME,
    type: "website" as const,
    locale: locale === "en" ? "en_US" : "mn_MN",
    title,
    description,
    images: imageId ? [{ url: `/img/${imageId}`, alt: title ?? SITE_NAME }] : [DEFAULT_OG_IMAGE],
  };
}

// <script type="application/ld+json"> body; "<" is escaped so data can't close the tag.
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
