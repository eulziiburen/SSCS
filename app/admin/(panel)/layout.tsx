import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Icons";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAuthenticated } from "@/lib/auth";
import { getBookings } from "@/lib/queries";
import { logout } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const newCount = (await getBookings()).filter((b) => b.status === "new").length;

  return (
    <div className="admin">
      <header className="a-top">
        <div className="a-wrap">
          <Link href="/admin" className="logo">
            <Logo height={24} /> <span className="a-tag">Admin</span>
          </Link>
          <AdminNav newCount={newCount} />
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
