import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tours = sqliteTable("tours", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["abroad", "local", "day"] }).notNull(),
  scene: text("scene").notNull(),
  country: text("country").notNull(),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  seats: integer("seats").notNull(),
  price: integer("price").notNull(),
  route: text("route").notNull(), // JSON string[]
  badge: text("badge"),
  hot: integer("hot", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  heroEyebrow: text("hero_eyebrow"),
  upcoming: integer("upcoming", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type", { enum: ["tour", "voucher"] }).notNull(),
  tourId: integer("tour_id"),
  tourTitle: text("tour_title").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  pax: integer("pax").notNull(),
  unitPrice: integer("unit_price").notNull(),
  total: integer("total").notNull(),
  status: text("status", { enum: ["new", "contacted", "confirmed", "cancelled"] }).notNull().default("new"),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});

export const news = sqliteTable("news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  title: text("title").notNull(),
  text: text("text").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export type TourRow = typeof tours.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type NewsRow = typeof news.$inferSelect;
