import Form from "next/form";
import type { Filter } from "@/lib/data";
import { SearchIcon } from "./Icons";

export const MONTHS = [
  { v: "9", l: "9-р сар" },
  { v: "10", l: "10-р сар" },
  { v: "11", l: "11-р сар" },
  { v: "12", l: "12-р сар" },
];

export const BUDGETS = [
  { v: "1000000", l: "1 сая ₮ хүртэл" },
  { v: "2500000", l: "2.5 сая ₮ хүртэл" },
  { v: "4000000", l: "4 сая ₮ хүртэл" },
];

// Plain GET form: works without JS, and next/form turns it into a client navigation
export function SearchForm({ values = {}, compact = false }: { values?: Filter; compact?: boolean }) {
  return (
    <Form action="/tours" className={`search-form${compact ? " compact" : ""}`} role="search">
      <div className="field grow">
        <label htmlFor="q">Хаашаа аялах вэ?</label>
        <input id="q" name="q" type="search" placeholder="Жишээ: Байгал, Хайнан, Хөвсгөл" defaultValue={values.q} />
      </div>
      <div className="field">
        <label htmlFor="month">Сар</label>
        <select id="month" name="month" defaultValue={values.month ?? ""}>
          <option value="">Бүх сар</option>
          {MONTHS.map((m) => (
            <option key={m.v} value={m.v}>
              {m.l}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="budget">Төсөв</label>
        <select id="budget" name="budget" defaultValue={values.budget ?? ""}>
          <option value="">Хязгааргүй</option>
          {BUDGETS.map((b) => (
            <option key={b.v} value={b.v}>
              {b.l}
            </option>
          ))}
        </select>
      </div>
      {values.kind && <input type="hidden" name="kind" value={values.kind} />}
      {values.sort && <input type="hidden" name="sort" value={values.sort} />}
      <button className="btn search-btn" type="submit">
        <SearchIcon /> Хайх
      </button>
    </Form>
  );
}
