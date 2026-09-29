import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { logoutUser } from "@/app/account-actions";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { fmt, type BookingStatus } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { getCurrentUser } from "@/lib/user-auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.account, robots: { index: false } };
}

export default async function AccountPage() {
  const [{ locale, t }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  if (!user) redirect("/login?next=/account");
  const a = t.auth;
  const mine = await db.select().from(bookings).where(eq(bookings.userId, user.id)).orderBy(desc(bookings.createdAt));
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "mn-MN", { timeZone: "Asia/Ulaanbaatar" });

  return (
    <div className="wrap page account">
      <div className="account-head">
        <h1 className="page-title">{a.hello(user.firstName)}</h1>
        <form action={logoutUser}>
          <button type="submit" className="btn ghost sm">
            {a.logout}
          </button>
        </form>
      </div>

      <div className="account-grid">
        <section className="account-card" aria-labelledby="acc-profile">
          <h2 id="acc-profile">{a.profile}</h2>
          <dl className="account-dl">
            <dt>{t.booking.lastName}</dt>
            <dd>{user.lastName}</dd>
            <dt>{t.booking.firstName}</dt>
            <dd>{user.firstName}</dd>
            <dt>{t.booking.email}</dt>
            <dd>{user.email}</dd>
            <dt>{t.booking.phone}</dt>
            <dd>{user.phone}</dd>
          </dl>
        </section>

        <section className="account-card" aria-labelledby="acc-bookings">
          <h2 id="acc-bookings">{a.myBookings}</h2>
          {mine.length === 0 ? (
            <div className="account-empty">
              <p>{a.noBookings}</p>
              <Link href="/tours" className="btn sm">
                {a.browseTours}
              </Link>
            </div>
          ) : (
            <ul className="account-bookings">
              {mine.map((b) => (
                <li key={b.id}>
                  <div>
                    <strong>{b.tourTitle}</strong>
                    <span className="mono">
                      {b.code} · {date(b.createdAt)}
                      {b.pax ? ` · ${b.pax}×` : ""}
                    </span>
                  </div>
                  <div className="account-bk-end">
                    <span className="mono">{b.total ? fmt(b.total) : a.toBeAgreed}</span>
                    <span className={`st st-${b.status}`}>{a.status[b.status as BookingStatus]}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
