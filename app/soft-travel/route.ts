import { getBrochureData, renderPublicBrochure } from "@/lib/brochure";

// Soft Travel flipbook brochure; its content is edited at /st-admin/brochure
export async function GET() {
  const html = renderPublicBrochure(await getBrochureData());
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
