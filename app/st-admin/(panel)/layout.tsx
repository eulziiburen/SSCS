import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Icons";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAuthenticated } from "@/lib/auth";
import { getBookings, getReviews } from "@/lib/queries";
import { logout } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/st-admin">) {
  if (!(await isAuthenticated())) redirect("/st-admin/login");
  const [allBookings, allReviews] = await Promise.all([getBookings(), getReviews({ approvedOnly: false })]);
  const newCount = allBookings.filter((b) => b.status === "new").length;
  const pendingReviews = allReviews.filter((r) => r.status === "pending").length;

  return (
    <div className="admin">
      <header className="a-top">
        <div className="a-wrap">
          <Link href="/st-admin" className="logo">
            <Logo height={24} /> <span className="a-tag">Admin</span>
          </Link>
          <AdminNav newCount={newCount} pendingReviews={pendingReviews} />
          <div className="a-top-end">
            <Link href="/" className="a-link" target="_blank">
              Сайт руу ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="a-btn">
                Гарах
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="a-wrap a-main">
        {children}
      </main>
    </div>
  );
}
