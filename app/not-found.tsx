import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

// Lives at the root so it also catches unknown URLs; renders the site chrome itself
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="empty">
          <strong>Хуудас олдсонгүй</strong>
          <p>Таны хайсан аялал эсвэл хуудас байхгүй байна.</p>
          <Link className="btn" href="/tours">
            Бүх аяллыг харах
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
