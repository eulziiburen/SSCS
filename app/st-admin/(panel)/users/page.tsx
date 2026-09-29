import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { deleteUser } from "@/app/st-admin/actions";
import { ConfirmButton } from "@/components/admin/Controls";
import { db, ensureDb } from "@/db/client";
import { bookings, users } from "@/db/schema";

export const metadata: Metadata = { title: "Хэрэглэгчид" };

export default async function UsersAdmin() {
  await ensureDb();
  const rows = await db
    .select({
      id: users.id,
      lastName: users.lastName,
      firstName: users.firstName,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      lockedUntil: users.lockedUntil,
      bookings: sql<number>`(SELECT COUNT(*) FROM ${bookings} WHERE ${bookings.userId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <>
      <h1 className="a-title">Хэрэглэгчид</h1>
      <p className="a-lead">Сайт дээр бүртгүүлсэн аялагчид ({rows.length}). Нууц үг нь зөвхөн hash хэлбэрээр хадгалагддаг тул энд харагдахгүй.</p>
      <section className="a-card flush">
        {rows.length === 0 && <p className="a-empty">Бүртгэлтэй хэрэглэгч алга.</p>}
        <ul className="a-news">
          {rows.map((u) => (
            <li key={u.id}>
              <div>
                <strong>
                  {u.lastName} {u.firstName}
                  {u.lockedUntil && Date.parse(u.lockedUntil) > Date.now() && <span className="a-pill red">Түр түгжигдсэн</span>}
                </strong>
                <p>
                  <a href={`mailto:${u.email}`}>{u.email}</a> · <a href={`tel:${u.phone.replace(/\s/g, "")}`}>{u.phone}</a>
                </p>
                <small className="mono a-sub">
                  {new Date(u.createdAt).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar" })} · {u.bookings} захиалга
                </small>
              </div>
              <div className="a-row-actions">
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <ConfirmButton message="Энэ хэрэглэгчийн бүртгэлийг устгах уу? Захиалгууд нь хадгалагдана." className="a-btn sm danger">
                    Устгах
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
