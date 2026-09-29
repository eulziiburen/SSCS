import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";
import { getI18n } from "@/lib/locale";
import { getCurrentUser } from "@/lib/user-auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.metaLogin, robots: { index: false } };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [{ next }, { t }, user] = await Promise.all([searchParams, getI18n(), getCurrentUser()]);
  if (user) redirect("/account");
  const back = typeof next === "string" ? next : undefined;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {t.auth.welcome} <span aria-hidden="true">👋</span>
        </h1>
        <p className="auth-lead">
          {t.auth.welcomeLead}{" "}
          <Link href={back ? `/register?next=${encodeURIComponent(back)}` : "/register"}>{t.auth.registerLink}</Link>
        </p>
        <LoginForm next={back} />
      </div>
    </div>
  );
}
