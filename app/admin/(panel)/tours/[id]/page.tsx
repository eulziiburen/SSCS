import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TourForm } from "@/components/admin/TourForm";
import { getTour } from "@/lib/queries";

export const metadata: Metadata = { title: "Аялал засах" };

export default async function EditTour({ params }: PageProps<"/admin/tours/[id]">) {
  const { id } = await params;
  const tour = await getTour(Number(id));
  if (!tour) notFound();

  return (
    <>
      <nav className="crumbs">
        <Link href="/admin/tours">Аялалууд</Link> / <span>#{tour.id}</span>
      </nav>
      <div className="a-head">
        <h1 className="a-title">{tour.title}</h1>
        {tour.published && (
          <Link href={`/tours/${tour.id}`} className="a-link" target="_blank">
            Сайт дээр харах ↗
          </Link>
        )}
      </div>
      <TourForm tour={tour} />
    </>
  );
}
