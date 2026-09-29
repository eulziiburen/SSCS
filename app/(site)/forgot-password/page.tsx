import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/AuthForms";
import { getI18n } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.metaForgot, robots: { index: false } };
}

export default async function ForgotPage() {
  const { t } = await getI18n();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t.auth.forgotTitle}</h1>
        <p className="auth-lead">{t.auth.forgotLead}</p>
        <ForgotForm />
        <p className="auth-foot">
          <Link href="/login">← {t.auth.backToLogin}</Link>
        </p>
      </div>
    </div>
  );
}
