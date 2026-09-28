import type { Metadata } from "next";
import Link from "next/link";
import { deleteReview, setReviewStatus } from "@/app/st-admin/actions";
import { ConfirmButton, SubmitButton } from "@/components/admin/Controls";
import { getReviews } from "@/lib/queries";

export const metadata: Metadata = { title: "Сэтгэгдэл" };

const FILTERS = [
  { key: "pending", label: "Хүлээгдэж буй" },
  { key: "approved", label: "Нийтэлсэн" },
  { key: "hidden", label: "Нуусан" },
  { key: "all", label: "Бүгд" },
] as const;

const STATUS_PILL = { pending: ["amber", "Хүлээгдэж буй"], approved: ["", "Нийтэлсэн"], hidden: ["red", "Нуусан"] } as const;

export default async function ReviewsAdmin({ searchParams }: PageProps<"/st-admin/reviews">) {
  const { status } = await searchParams;
  const all = await getReviews({ approvedOnly: false });
  const active = FILTERS.find((f) => f.key === status)?.key ?? (all.some((r) => r.status === "pending") ? "pending" : "all");
  const items = active === "all" ? all : all.filter((r) => r.status === active);
  const count = (key: string) => (key === "all" ? all.length : all.filter((r) => r.status === key).length);

  return (
    <>
      <h1 className="a-title">Сэтгэгдэл</h1>
      <p className="a-lead">
        Аялагчид нүүр хуудаснаас и-мэйлээ бүртгүүлж сэтгэгдэл илгээнэ. Та “Нийтлэх” дарсны дараа л сайтад гарна. Нийтэлсэн сэтгэгдэл байхгүй үед жишээ 3 сэтгэгдэл харагдана.
      </p>
      <nav className="a-filters" aria-label="Шүүлтүүр">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/st-admin/reviews?status=${f.key}`} className={`a-btn sm${active === f.key ? " on" : ""}`} aria-current={active === f.key ? "page" : undefined}>
            {f.label} ({count(f.key)})
          </Link>
        ))}
      </nav>

      <section className="a-card flush">
        {items.length === 0 && <p className="a-empty">Сэтгэгдэл алга.</p>}
        <ul className="a-news">
          {items.map((r) => {
            const [tone, label] = STATUS_PILL[r.status];
            return (
              <li key={r.id} className={r.status === "hidden" ? "muted" : ""}>
                <div>
                  <span className="stars" aria-label={`${r.rating} од`}>
                    {"★".repeat(r.rating)}
                    <span className="off">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <span className={`a-pill ${tone}`}>{label}</span>
                  <strong>
                    {r.name}
                    {r.trip && <span className="a-sub"> · {r.trip}</span>}
                  </strong>
                  <p>{r.text}</p>
                  <small className="mono a-sub">
                    <a href={`mailto:${r.email}`}>{r.email}</a> · {new Date(r.createdAt).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar" })} · {r.locale.toUpperCase()}
                  </small>
                </div>
                <div className="a-row-actions">
                  {r.status !== "approved" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <SubmitButton className="a-btn sm primary">Нийтлэх</SubmitButton>
                    </form>
                  )}
                  {r.status !== "hidden" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <SubmitButton className="a-btn sm">Нуух</SubmitButton>
                    </form>
                  )}
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Энэ сэтгэгдлийг устгах уу?" className="a-btn sm danger">
                      Устгах
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
