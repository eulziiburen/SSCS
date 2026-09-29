import type { Metadata } from "next";
import Link from "next/link";
import { ServiceRequest } from "@/components/ServiceRequest";
import { getI18n } from "@/lib/locale";
import { isServiceKey, SERVICE_ICON, SERVICE_KEYS, type ServiceKey } from "@/lib/services";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.svc.metaTitle, description: t.svc.lead };
}

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const [{ s }, { t }] = await Promise.all([searchParams, getI18n()]);
  const names = Object.fromEntries(SERVICE_KEYS.map((k, i) => [k, t.home.serviceList[i][0]])) as Record<ServiceKey, string>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label={t.list.breadcrumb}>
        <Link href="/">{t.list.home}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{t.svc.menu}</span>
      </nav>
      <h1 className="page-title">{t.svc.title}</h1>
      <p className="page-lead">{t.svc.lead}</p>

      <div className="svc-grid">
        {SERVICE_KEYS.map((k, i) => (
          <article key={k} id={k} className="svc-card">
            <span className="svc-ic" aria-hidden="true">
              {SERVICE_ICON[k]}
            </span>
            <h2>{t.home.serviceList[i][0]}</h2>
            <p>{t.home.serviceList[i][1]}</p>
            <Link href={`/services?s=${k}#request`} className="btn ghost sm">
              {t.svc.request}
            </Link>
          </article>
        ))}
      </div>

      <section id="request" className="calc-card svc-request-card" aria-labelledby="request-h">
        {/* key: picking another service card remounts the form with that service selected */}
        <ServiceRequest key={String(s)} initial={isServiceKey(s) ? s : "sim"} names={names} today={today} />
      </section>
    </div>
  );
}
