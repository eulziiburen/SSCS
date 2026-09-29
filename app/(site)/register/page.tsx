import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";
import { getI18n } from "@/lib/locale";
import { getCurrentUser } from "@/lib/user-auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.metaRegister, robots: { index: false } };
}

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const [{ next }, { t }, user] = await Promise.all([searchParams, getI18n(), getCurrentUser()]);
  if (user) redirect("/account");
  const back = typeof next === "string" ? next : undefined;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t.auth.registerTitle}</h1>
        <p className="auth-lead">{t.auth.registerLead}</p>
        <RegisterForm next={back} />
        <p className="auth-foot">
          {t.auth.haveAccount} <Link href={back ? `/login?next=${encodeURIComponent(back)}` : "/login"}>{t.auth.login}</Link>
        </p>
      </div>
    </div>
  );
}
