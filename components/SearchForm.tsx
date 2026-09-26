import Form from "next/form";
import type { Filter } from "@/lib/data";
import { getI18n } from "@/lib/locale";
import { SearchIcon } from "./Icons";

export const MONTHS = [9, 10, 11, 12];

export const BUDGETS = ["1000000", "2500000", "4000000"];

export const budgetMillions = (v: string) => String(Number(v) / 1_000_000);

// Plain GET form: works without JS, and next/form turns it into a client navigation
export async function SearchForm({ values = {}, compact = false }: { values?: Filter; compact?: boolean }) {
  const { t } = await getI18n();
  return (
    <Form action="/tours" className={`search-form${compact ? " compact" : ""}`} role="search">
      <div className="field grow">
        <label htmlFor="q">{t.search.where}</label>
        <input id="q" name="q" type="search" placeholder={t.search.placeholder} defaultValue={values.q} />
      </div>
      <div className="field">
        <label htmlFor="month">{t.search.month}</label>
        <select id="month" name="month" defaultValue={values.month ?? ""}>
          <option value="">{t.search.anyMonth}</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {t.search.monthName(m)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="budget">{t.search.budget}</label>
        <select id="budget" name="budget" defaultValue={values.budget ?? ""}>
          <option value="">{t.search.anyBudget}</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {t.search.budgetUpTo(budgetMillions(b))}
            </option>
          ))}
        </select>
      </div>
      {values.kind && <input type="hidden" name="kind" value={values.kind} />}
      {values.sort && <input type="hidden" name="sort" value={values.sort} />}
      <button className="btn search-btn" type="submit">
        <SearchIcon /> {t.search.submit}
      </button>
    </Form>
  );
}
