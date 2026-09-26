import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="empty">
        <strong>Хуудас олдсонгүй</strong>
        <p>Таны хайсан аялал эсвэл хуудас байхгүй байна.</p>
        <Link className="btn" href="/tours">
          Бүх аяллыг харах
        </Link>
      </div>
    </div>
  );
}
