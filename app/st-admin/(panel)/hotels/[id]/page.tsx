import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotelForm } from "@/components/admin/HotelForm";
import { getHotel, getRegions } from "@/lib/queries";

export const metadata: Metadata = { title: "Буудал засах" };

export default async function EditHotel({ params }: PageProps<"/st-admin/hotels/[id]">) {
  const { id } = await params;
  const [hotel, regions] = await Promise.all([getHotel(Number(id)), getRegions()]);
  if (!hotel) notFound();

  return (
    <>
      <nav className="crumbs">
        <Link href="/st-admin/hotels">Зочид буудал</Link> / <span>#{hotel.id}</span>
      </nav>
      <div className="a-head">
        <h1 className="a-title">{hotel.name}</h1>
        {hotel.published && (
          <Link href={`/hotels/${hotel.id}`} className="a-link" target="_blank">
            Сайт дээр харах ↗
          </Link>
        )}
      </div>
      <HotelForm hotel={hotel} regions={regions.map((r) => ({ code: r.code, name: r.name }))} />
    </>
  );
}
