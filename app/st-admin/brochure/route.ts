import { isAuthenticated } from "@/lib/auth";
import {
  BROCHURE_MAX_BYTES,
  getBrochureData,
  isBrochureData,
  renderAdminBrochure,
  saveBrochureData,
} from "@/lib/brochure";

// The brochure editor: the same flipbook as /soft-travel, with editing and saving turned on.
export async function GET(req: Request) {
  if (!(await isAuthenticated())) return Response.redirect(new URL("/st-admin/login", req.url), 303);
  return new Response(renderAdminBrochure(await getBrochureData()), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return Response.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  const body = await req.text();
  if (body.length > BROCHURE_MAX_BYTES) return Response.json({ error: "Хэт том байна" }, { status: 413 });
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return Response.json({ error: "Өгөгдөл буруу байна" }, { status: 400 });
  }
  if (!isBrochureData(data)) return Response.json({ error: "Өгөгдөл буруу байна" }, { status: 400 });
  await saveBrochureData(data);
  return Response.json({ ok: true });
}

