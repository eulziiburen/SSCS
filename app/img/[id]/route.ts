import { eq } from "drizzle-orm";
import { db, ensureDb } from "@/db/client";
import { images } from "@/db/schema";

// An uploaded photo never changes (a new upload gets a new id), so the CDN can keep it forever
export async function GET(_req: Request, ctx: RouteContext<"/img/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  await ensureDb();
  const [img] = await db.select().from(images).where(eq(images.id, id));
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
