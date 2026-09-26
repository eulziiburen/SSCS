import Link from "next/link";
import { getI18n } from "@/lib/locale";
import { Logo } from "./Icons";

export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer id="contact" className="site-foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="logo">
              <Logo tone="dark" height={28} />
            </div>
            <p>{t.footer.tagline}</p>
          </div>
          <div>
            <h4>{t.footer.menu}</h4>
            <ul>
              <li><Link href="/tours">{t.home.allTours}</Link></li>
              <li><Link href="/tours?kind=abroad">{t.kind.abroad}</Link></li>
              <li><Link href="/tours?kind=local">{t.kind.local}</Link></li>
              <li><Link href="/tours?kind=day">{t.kind.day}</Link></li>
              <li><Link href="/#news">{t.nav.news}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t.footer.contact}</h4>
            <ul>
              <li><a href="tel:+97670000000">(+976) 7000-0000</a></li>
              <li><a href="mailto:info@sscs.mn">info@sscs.mn</a></li>
              <li>{t.footer.address}</li>
              <li>{t.footer.hours}</li>
            </ul>
          </div>
        </div>
        <div className="copy">© 2026 Soft Travel. {t.footer.rights}</div>
      </div>
    </footer>
  );
}
