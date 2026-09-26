import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { SEED_NEWS, SEED_TOURS } from "./seed-data";

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
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);
`;

const TOUR_COLS = ["kind", "scene", "country", "title", "start_date", "end_date", "seats", "price", "route", "badge", "hot", "featured", "hero_eyebrow", "upcoming", "published"];

async function init() {
  await client.executeMultiple(DDL);
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
