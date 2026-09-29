import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { REGION_SEED } from "./regions-seed";
import { SEED_NEWS, SEED_NEWS_EN, SEED_TOURS, SEED_TOURS_EN } from "./seed-data";

const url = process.env.TURSO_DATABASE_URL;

// Vercel's filesystem is read-only at runtime, so a local SQLite file only works on a dev machine
if (!url && process.env.VERCEL) {
  throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN тохируулагдаагүй байна (Vercel → Settings → Environment Variables).");
}

const client = createClient(url ? { url, authToken: process.env.TURSO_AUTH_TOKEN } : { url: "file:local.db" });

export const db = drizzle(client, { schema });

const DDL = `
CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  scene TEXT NOT NULL,
  country TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  seats INTEGER NOT NULL,
  price INTEGER NOT NULL,
  route TEXT NOT NULL,
  badge TEXT,
  hot INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  hero_eyebrow TEXT,
  upcoming INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  tour_id INTEGER,
  tour_title TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pax INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS regions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  center TEXT NOT NULL,
  center_en TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  history TEXT NOT NULL,
  history_en TEXT NOT NULL,
  culture TEXT NOT NULL,
  culture_en TEXT NOT NULL,
  attractions TEXT NOT NULL,
  attractions_en TEXT NOT NULL,
  image_id INTEGER
);
CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  region_code TEXT NOT NULL,
  city TEXT NOT NULL,
  city_en TEXT,
  stars INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  price_per_night INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT,
  amenities TEXT NOT NULL DEFAULT '[]',
  image_id INTEGER,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  trip TEXT,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'mn',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  phone_iso TEXT NOT NULL,
  phone_norm TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose TEXT NOT NULL,
  target TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS otp_codes_target ON otp_codes (target, purpose);
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL
);
`;

const TOUR_COLS = ["kind", "scene", "country", "title", "start_date", "end_date", "seats", "price", "route", "badge", "hot", "featured", "hero_eyebrow", "upcoming", "published"];

// Columns added after the first release; CREATE TABLE IF NOT EXISTS won't add them to an existing table
const ADDED_COLUMNS: Record<string, string[]> = {
  tours: ["title_en", "country_en", "route_en", "hero_eyebrow_en", "image_id INTEGER", "schedule", "schedule_en"],
  news: ["title_en", "text_en"],
  bookings: ["details", "email", "last_name", "first_name", "user_id INTEGER"],
};

async function migrate() {
  for (const [table, cols] of Object.entries(ADDED_COLUMNS)) {
    const { rows } = await client.execute(`PRAGMA table_info(${table})`);
    const have = new Set(rows.map((r) => String(r.name)));
    for (const spec of cols) {
      // "name" or "name TYPE"; TEXT when no type is given
      const [col, type = "TEXT"] = spec.split(" ");
      if (have.has(col)) continue;
      try {
        await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      } catch (e) {
        // Another instance may have added it between our check and the ALTER
        if (!String(e).includes("duplicate column")) throw e;
      }
    }
  }
}

// Fills in English copy for seed rows that don't have it yet; admin-entered translations are never overwritten
async function backfillEnglish() {
  const tours = await client.execute("SELECT id, title FROM tours WHERE title_en IS NULL");
  const newsRows = await client.execute("SELECT id, title FROM news WHERE title_en IS NULL");
  const stmts = [
    ...tours.rows.flatMap((r) => {
      const en = SEED_TOURS_EN[String(r.title)];
      return en
        ? [{ sql: "UPDATE tours SET title_en = ?, country_en = ?, route_en = ?, hero_eyebrow_en = ? WHERE id = ? AND title_en IS NULL", args: [en.titleEn, en.countryEn, en.routeEn, en.heroEyebrowEn ?? null, r.id] }]
        : [];
    }),
    ...newsRows.rows.flatMap((r) => {
      const en = SEED_NEWS_EN[String(r.title)];
      return en ? [{ sql: "UPDATE news SET title_en = ?, text_en = ? WHERE id = ? AND title_en IS NULL", args: [en.titleEn, en.textEn, r.id] }] : [];
    }),
  ];
  if (stmts.length) await client.batch(stmts, "write");
}

async function init() {
  await client.executeMultiple(DDL);
  await migrate();
  await seed();
  await seedRegions();
  await backfillEnglish();
}

// Adds any province that's missing; never touches rows an admin has edited
async function seedRegions() {
  const { rows } = await client.execute("SELECT code FROM regions");
  const have = new Set(rows.map((r) => String(r.code)));
  const missing = REGION_SEED.filter((r) => !have.has(r.code));
  if (!missing.length) return;
  await client.batch(
    missing.map((r) => ({
      sql: "INSERT OR IGNORE INTO regions (code, name, name_en, center, center_en, summary, summary_en, history, history_en, culture, culture_en, attractions, attractions_en) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [r.code, r.name, r.nameEn, r.center, r.centerEn, r.summary, r.summaryEn, r.history, r.historyEn, r.culture, r.cultureEn, r.attractions, r.attractionsEn],
    })),
    "write",
  );
}

async function seed() {
  // A write transaction serializes concurrent first requests (e.g. parallel build workers), so seeding happens once
  const tx = await client.transaction("write");
  try {
    const { rows } = await tx.execute("SELECT (SELECT COUNT(*) FROM tours) AS t, (SELECT COUNT(*) FROM news) AS n");
    if (Number(rows[0].t) === 0) {
      for (const t of SEED_TOURS) {
        await tx.execute({
          sql: `INSERT INTO tours (${TOUR_COLS.join(",")}) VALUES (${TOUR_COLS.map(() => "?").join(",")})`,
          args: [t.kind, t.scene, t.country, t.title, t.startDate, t.endDate, t.seats, t.price, t.route, t.badge ?? null, t.hot ? 1 : 0, t.featured ? 1 : 0, t.heroEyebrow ?? null, t.upcoming ? 1 : 0, t.published === false ? 0 : 1],
        });
      }
    }
    if (Number(rows[0].n) === 0) {
      for (const n of SEED_NEWS) {
        await tx.execute({ sql: "INSERT INTO news (date, title, text, published) VALUES (?, ?, ?, 1)", args: [n.date, n.title, n.text] });
      }
    }
    await tx.commit();
  } finally {
    tx.close();
  }
}

let ready: Promise<void> | null = null;

// Creates tables and seeds the original site content on first use, so a fresh database needs no manual setup
export function ensureDb() {
  ready ??= init().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
