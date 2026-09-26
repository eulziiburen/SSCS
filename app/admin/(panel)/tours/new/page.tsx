import type { Metadata } from "next";
import Link from "next/link";
import { TourForm } from "@/components/admin/TourForm";

export const metadata: Metadata = { title: "Шинэ аялал" };

export default function NewTour() {
  return (
    <>
      <nav className="crumbs">
        <Link href="/admin/tours">Аялалууд</Link> / <span>Шинэ</span>
      </nav>
      <h1 className="a-title">Шинэ аялал</h1>
      <TourForm />
    </>
  );
}
