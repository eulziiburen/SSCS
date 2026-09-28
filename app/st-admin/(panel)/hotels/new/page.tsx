import type { Metadata } from "next";
import Link from "next/link";
import { HotelForm } from "@/components/admin/HotelForm";
import { getRegions } from "@/lib/queries";

export const metadata: Metadata = { title: "Шинэ буудал" };

export default async function NewHotel() {
  const regions = (await getRegions()).map((r) => ({ code: r.code, name: r.name }));
  return (
    <>
      <nav className="crumbs">
        <Link href="/st-admin/hotels">Зочид буудал</Link> / <span>Шинэ</span>
      </nav>
      <h1 className="a-title">Шинэ буудал</h1>
      <HotelForm regions={regions} />
    </>
  );
}
