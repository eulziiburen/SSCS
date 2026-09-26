import type { Metadata } from "next";
import Link from "next/link";
import { saveCalcSettings } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/Controls";
import { ADDONS, CURRENCIES, type Addon } from "@/lib/calc";
import { getCalcSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Тооцоолуур" };

const ADDON_LABEL: Record<Addon, string> = {
  sim: "Дата сим — нэг хүнд (зөвхөн гадаад аялал)",
  insurance: "Нэмэлт даатгал — хүн тутамд, өдөрт",
  guide: "Хувийн хөтөч — өдөрт",
  photo: "Зурагчин — өдөрт",
};

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const [{ saved }, s] = await Promise.all([searchParams, getCalcSettings()]);

  return (
    <>
      <div className="a-head">
        <h1 className="a-title">Тооцоолуур</h1>
        <Link href="/calculator" className="a-link" target="_blank">
          Сайт дээр харах ↗
        </Link>
      </div>
      {saved && (
        <p className="a-alert ok" role="status">
          Хадгалагдлаа.
        </p>
      )}
      <form action={saveCalcSettings} className="a-form">
        <section className="a-card">
          <h2>Үнийн дүрэм</h2>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="childPercent">Хүүхдийн үнэ (том хүний %)</label>
              <input id="childPercent" name="childPercent" type="number" min={0} max={100} defaultValue={s.childPercent} required />
            </div>
            <div className="field">
              <label htmlFor="singlePerNight">Ганц өрөөний нэмэгдэл (₮ / шөнө)</label>
              <input id="singlePerNight" name="singlePerNight" type="number" min={0} defaultValue={s.singlePerNight} required />
            </div>
          </div>
        </section>

        <section className="a-card">
          <h2>Нэмэлт үйлчилгээний үнэ (₮)</h2>
          <div className="a-grid4">
            {ADDONS.map((a) => (
              <div className="field" key={a}>
                <label htmlFor={`addon_${a}`}>{ADDON_LABEL[a]}</label>
                <input id={`addon_${a}`} name={`addon_${a}`} type="number" min={0} defaultValue={s.addons[a]} required />
              </div>
            ))}
          </div>
        </section>

        <section className="a-card">
          <div>
            <h2>Валютын ханш</h2>
            <p className="a-hint">1 нэгж валют хэдэн төгрөг болохыг оруулна. Сайт дээр ойролцоо дүн гэж харагдана.</p>
          </div>
          <div className="a-grid4">
            {CURRENCIES.map((c) => (
              <div className="field" key={c}>
                <label htmlFor={`rate_${c}`}>1 {c} = ₮</label>
                <input id={`rate_${c}`} name={`rate_${c}`} type="number" min={0} step="any" defaultValue={s.rates[c]} required />
              </div>
            ))}
            <div className="field">
              <label htmlFor="ratesDate">Ханшийн огноо</label>
              <input id="ratesDate" name="ratesDate" type="date" defaultValue={s.ratesDate} required />
            </div>
          </div>
        </section>

        <div className="a-actions">
          <SubmitButton>Хадгалах</SubmitButton>
        </div>
      </form>
    </>
  );
}
