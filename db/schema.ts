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
  type: text("type", { enum: ["tour", "voucher", "hotel", "custom"] }).notNull(),
  tourId: integer("tour_id"),
  tourTitle: text("tour_title").notNull(),
  name: text("name").notNull(), // "Овог Нэр", kept for display and older rows
  lastName: text("last_name"),
  firstName: text("first_name"),
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

// Provinces for the Mongolia map; code matches lib/mongolia-map.ts
export const regions = sqliteTable("regions", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  center: text("center").notNull(),
  centerEn: text("center_en").notNull(),
  summary: text("summary").notNull(),
  summaryEn: text("summary_en").notNull(),
  history: text("history").notNull(),
  historyEn: text("history_en").notNull(),
  culture: text("culture").notNull(),
  cultureEn: text("culture_en").notNull(),
  attractions: text("attractions").notNull(), // one per line
  attractionsEn: text("attractions_en").notNull(),
  imageId: integer("image_id"),
});

export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  regionCode: text("region_code").notNull(),
  city: text("city").notNull(),
  cityEn: text("city_en"),
  stars: integer("stars").notNull().default(0), // 0 = unrated
  category: text("category").notNull(), // see HOTEL_CATEGORIES
  pricePerNight: integer("price_per_night").notNull(), // ₮ per room
  description: text("description").notNull().default(""),
  descriptionEn: text("description_en"),
  amenities: text("amenities").notNull().default("[]"), // JSON HotelAmenity[]
  imageId: integer("image_id"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

// Traveler-submitted reviews; shown on the site only after an admin approves them
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(), // never shown publicly
  trip: text("trip"),
  rating: integer("rating").notNull(), // 1–5
  text: text("text").notNull(),
  locale: text("locale").notNull().default("mn"),
  status: text("status", { enum: ["pending", "approved", "hidden"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON
});

export type TourRow = typeof tours.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type NewsRow = typeof news.$inferSelect;
export type RegionRow = typeof regions.$inferSelect;
export type HotelRow = typeof hotels.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
