// Client-safe types and helpers. Database access lives in lib/queries.ts.

export type Kind = "abroad" | "local" | "day";

export const SCENE_KEYS = ["baikal", "hainan", "shanghai", "canton", "manzhouli", "zhangjiajie", "khuvsgul", "gobi", "terelj", "altai", "khustai", "seoul"] as const;
export type SceneKey = (typeof SCENE_KEYS)[number];

export const SCENE_LABEL: Record<SceneKey, string> = {
  baikal: "Нуур, уул",
  hainan: "Далайн эрэг, далдуу мод",
  shanghai: "Хот (улбар шар)",
  canton: "Хот (цэнхэр)",
  manzhouli: "Хот (тал)",
  zhangjiajie: "Хадан багана",
  khuvsgul: "Нуур, шинэс",
  gobi: "Элсэн манхан",
  terelj: "Тал, гэр",
  altai: "Цаст уул",
  khustai: "Шар тал, гэр",
  seoul: "Хот (ягаан)",
};

export type Tour = {
  id: number;
  kind: Kind;
  scene: SceneKey;
  country: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  seats: number;
  price: number;
  route: string[];
  badge: string | null;
  hot: boolean;
  featured: boolean;
  heroEyebrow: string | null;
  upcoming: boolean;
  published: boolean;
};

export type NewsItem = { id: number; date: string; title: string; text: string; published: boolean };

export const KIND_LABEL: Record<Kind, string> = {
  abroad: "Гадаад аялал",
  local: "Дотоод аялал",
  day: "Өдрийн аялал",
};

export const INCLUDES: Record<Kind, string[]> = {
  abroad: ["Хоёр талын нислэг", "Зочид буудал (2 хүн нэг өрөөнд)", "Өглөөний цай", "Хөтөлбөрийн дагуу тээвэр", "Монгол хэлтэй хөтөч", "Аяллын даатгал"],
  local: ["Тээвэр (жолоочтой)", "Гэр кемп / жуулчны бааз", "Өдөрт 3 удаагийн хоол", "Хөтөч", "Үзвэрийн тасалбар"],
  day: ["Автобусаар хүргэлт", "Өдрийн хоол", "Хөтөч", "Үзвэрийн тасалбар"],
};

export const EXCLUDES: Record<Kind, string[]> = {
  abroad: ["Виз (шаардлагатай бол)", "Хувийн зардал", "Нэмэлт аялал"],
  local: ["Морь, тэмээ унах", "Хувийн зардал"],
  day: ["Морь унах", "Хувийн зардал"],
};

export const REVIEWS = [
  { name: "Болормаа", trip: "Хөвсгөл · 3 хоног", text: "Зохион байгуулалт гайхалтай байсан. Хөтөч маань Хөвсгөлийн түүхийг их сонирхолтой ярьсан." },
  { name: "Тэмүүлэн", trip: "Байгал нуур · 6 хоног", text: "Нислэг, буудал, хөтөлбөр бүгд цаг хугацаандаа, төлөвлөгөөний дагуу болсон." },
  { name: "Анударь", trip: "Тэрэлж · өдрийн", text: "Гэр бүлээрээ амрахад их тохиромжтой. Хүүхдүүд маань морь унаад маш их баярласан." },
];

export const VOUCHER_PRICE = 500000;
export const VOUCHER_AMOUNTS = [200000, VOUCHER_PRICE, 1000000];

export const BOOKING_STATUS = {
  new: "Шинэ",
  contacted: "Холбогдсон",
  confirmed: "Баталгаажсан",
  cancelled: "Цуцалсан",
} as const;
export type BookingStatus = keyof typeof BOOKING_STATUS;

export const fmt = (n: number) => n.toLocaleString("en-US") + "₮";

export const dotDate = (iso: string) => iso.replaceAll("-", ".");

export const dateRange = (t: Pick<Tour, "startDate" | "endDate">) =>
  t.startDate === t.endDate ? dotDate(t.startDate) : `${dotDate(t.startDate)} – ${dotDate(t.endDate.slice(5))}`;

export const daysLabel = (t: Pick<Tour, "days">) => (t.days === 1 ? "1 өдөр" : `${t.days} өдөр ${t.days - 1} шөнө`);

export const daysBetween = (start: string, end: string) => Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;

export type Filter = { q?: string; kind?: string; month?: string; budget?: string; sort?: string };

export function filterTours(tours: Tour[], { q, kind, month, budget, sort }: Filter): Tour[] {
  const needle = q?.trim().toLowerCase();
  const list = tours.filter((t) => {
    if (needle && !`${t.title} ${t.country} ${t.route.join(" ")}`.toLowerCase().includes(needle)) return false;
    if (kind && t.kind !== kind) return false;
    if (month && Number(t.startDate.slice(5, 7)) !== Number(month)) return false;
    if (budget && t.price > Number(budget)) return false;
    return true;
  });
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return list;
}
