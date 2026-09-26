import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getI18n } from "@/lib/locale";

// Lives at the root so it also catches unknown URLs; renders the site chrome itself
export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="empty">
          <strong>{t.notFound.title}</strong>
          <p>{t.notFound.text}</p>
          <Link className="btn" href="/tours">
            {t.list.seeAll}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
