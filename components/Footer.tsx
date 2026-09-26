import Link from "next/link";
import { Logo } from "./Icons";

export function Footer() {
  return (
    <footer id="contact" className="site-foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="logo">
              <Logo tone="dark" height={28} />
            </div>
            <p>Монгол орон болон дэлхийн өнцөг булан бүрээр тухтай, найдвартай аялуулна.</p>
          </div>
          <div>
            <h4>Цэс</h4>
            <ul>
              <li><Link href="/tours">Бүх аялал</Link></li>
              <li><Link href="/tours?kind=abroad">Гадаад аялал</Link></li>
              <li><Link href="/tours?kind=local">Дотоод аялал</Link></li>
              <li><Link href="/tours?kind=day">Өдрийн аялал</Link></li>
              <li><Link href="/#news">Мэдээ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Холбоо барих</h4>
            <ul>
              <li><a href="tel:+97670000000">(+976) 7000-0000</a></li>
              <li><a href="mailto:info@talayalal.mn">info@talayalal.mn</a></li>
              <li>Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо, Төв цамхаг 8 давхар</li>
              <li>Даваа–Баасан 09:00–18:00</li>
            </ul>
          </div>
        </div>
        <div className="copy">© 2026 Soft Travel. Бүх эрх хуулиар хамгаалагдсан.</div>
      </div>
    </footer>
  );
}
