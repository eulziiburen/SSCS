import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tours = sqliteTable("tours", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["abroad", "local", "day"] }).notNull(),
  scene: text("scene").notNull(),
  country: text("country").notNull(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  countryEn: text("country_en"),
  routeEn: text("route_en"), // JSON string[]
  heroEyebrowEn: text("hero_eyebrow_en"),
  imageId: integer("image_id"), // uploaded photo (images.id); falls back to the scene illustration
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
  email: text("email"), // nullable: bookings made before email was collected have none
  pax: integer("pax").notNull(),
  unitPrice: integer("unit_price").notNull(),
  total: integer("total").notNull(),
  status: text("status", { enum: ["new", "contacted", "confirmed", "cancelled"] }).notNull().default("new"),
  note: text("note"),
  details: text("details"), // calculator breakdown, e.g. "Том 2, хүүхэд 1 · Ганц өрөө 1"
  createdAt: text("created_at").notNull(),
});

export const news = sqliteTable("news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  title: text("title").notNull(),
  text: text("text").notNull(),
  titleEn: text("title_en"),
  textEn: text("text_en"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

// Uploaded photos live in the database so the site needs no separate file storage
export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mime: text("mime").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON
});

export type TourRow = typeof tours.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type NewsRow = typeof news.$inferSelect;
