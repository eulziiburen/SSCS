import type { Metadata } from "next";
import Link from "next/link";
import { SimCatalog } from "@/components/SimCatalog";
import { getI18n } from "@/lib/locale";
import { getSimPlans } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.sim.metaTitle, description: t.sim.lead };
}

export default async function SimPage() {
  const [{ t }, plans] = await Promise.all([getI18n(), getSimPlans()]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <Link href="/services">{t.svc.menu}</Link> <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{t.sim.title}</span>
      </nav>
      <h1 className="page-title">
        <span aria-hidden="true">📶</span> {t.sim.title}
      </h1>
      <p className="page-lead">{t.sim.lead}</p>
      <SimCatalog plans={plans} today={today} />
    </div>
  );
}
