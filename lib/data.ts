export type Kind = "abroad" | "local" | "day";

export type SceneKey =
  | "baikal"
  | "hainan"
  | "shanghai"
  | "canton"
  | "manzhouli"
  | "zhangjiajie"
  | "khuvsgul"
  | "gobi"
  | "terelj"
  | "altai"
  | "khustai"
  | "seoul";

export type Tour = {
  id: number;
  kind: Kind;
  scene: SceneKey;
  country: string;
  title: string;
  from: string; // YYYY.MM.DD
  to: string; // MM.DD
  days: number;
  seats: number;
  price: number;
  route: string[];
  badge?: string;
  hot?: boolean;
};

export const KIND_LABEL: Record<Kind, string> = {
  abroad: "Гадаад аялал",
  local: "Дотоод аялал",
  day: "Өдрийн аялал",
};

export const TOURS: Tour[] = [
  { id: 1, kind: "abroad", scene: "baikal", country: "ОХУ", title: "Байгал нуур – Эрхүү хотын аялал", from: "2026.09.30", to: "10.05", days: 6, seats: 2, price: 900000, badge: "ОНЦЛОХ", route: ["Улаанбаатар", "Эрхүү", "Листвянка", "Улаанбаатар"] },
  { id: 2, kind: "abroad", scene: "shanghai", country: "БНХАУ", title: "Шанхай хотын шууд нислэгтэй аялал (Диснейлэндтэй)", from: "2026.10.29", to: "11.03", days: 6, seats: 4, price: 3590000, badge: "ЭРЭЛТТЭЙ", hot: true, route: ["Улаанбаатар", "Шанхай", "Диснейлэнд", "Улаанбаатар"] },
  { id: 3, kind: "abroad", scene: "canton", country: "БНХАУ", title: "Canton Fair 2026: Гуанжоу – Макао", from: "2026.10.13", to: "10.21", days: 9, seats: 2, price: 2750000, badge: "ОНЦЛОХ", route: ["Улаанбаатар", "Гуанжоу", "Макао", "Улаанбаатар"] },
  { id: 4, kind: "abroad", scene: "seoul", country: "БНСУ", title: "Сөүл – Жэжү намрын аялал", from: "2026.11.06", to: "11.12", days: 7, seats: 6, price: 2890000, route: ["Улаанбаатар", "Сөүл", "Жэжү", "Улаанбаатар"] },
  { id: 5, kind: "abroad", scene: "manzhouli", country: "БНХАУ", title: "Манжуур хотын шууд нислэгтэй аялал · 4 шөнө 5 өдөр", from: "2026.09.26", to: "09.30", days: 5, seats: 5, price: 1080000, route: ["Улаанбаатар", "Манжуур", "Улаанбаатар"] },
  { id: 6, kind: "abroad", scene: "hainan", country: "БНХАУ", title: "Хайнан арлын аялал", from: "2026.09.29", to: "10.05", days: 8, seats: 4, price: 2590000, route: ["Улаанбаатар", "Хайкоу", "Саняа", "Улаанбаатар"] },
  { id: 7, kind: "abroad", scene: "hainan", country: "БНХАУ · Сингапур", title: "Хайнан – Сингапур хосолсон аялал", from: "2026.09.29", to: "10.06", days: 7, seats: 4, price: 5900000, badge: "ОНЦЛОХ", route: ["Улаанбаатар", "Хайкоу", "Сингапур", "Саняа", "Улаанбаатар"] },
  { id: 8, kind: "abroad", scene: "zhangjiajie", country: "БНХАУ", title: "Чунчин – Жанжиажэ шууд нислэгтэй аялал", from: "2026.10.18", to: "10.24", days: 7, seats: 8, price: 3150000, route: ["Улаанбаатар", "Чунчин", "Жанжиажэ", "Улаанбаатар"] },
  { id: 9, kind: "local", scene: "khuvsgul", country: "Хөвсгөл", title: "Хөвсгөл нуур – Хатгал тосгон", from: "2026.10.02", to: "10.04", days: 3, seats: 10, price: 690000, badge: "ЭРЭЛТТЭЙ", hot: true, route: ["Улаанбаатар", "Мөрөн", "Хатгал", "Улаанбаатар"] },
  { id: 10, kind: "local", scene: "gobi", country: "Өмнөговь", title: "Хонгорын элс – Ёлын ам – Баянзаг", from: "2026.10.08", to: "10.13", days: 6, seats: 7, price: 1450000, badge: "ОНЦЛОХ", route: ["Улаанбаатар", "Даланзадгад", "Ёлын ам", "Хонгорын элс", "Баянзаг", "Улаанбаатар"] },
  { id: 11, kind: "local", scene: "altai", country: "Баян-Өлгий", title: "Алтай Таван Богд – Бүргэдийн баяр", from: "2026.10.03", to: "10.09", days: 7, seats: 3, price: 2350000, route: ["Улаанбаатар", "Өлгий", "Таван Богд", "Улаанбаатар"] },
  { id: 12, kind: "day", scene: "terelj", country: "Төв аймаг", title: "Тэрэлж – Мэлхий хад – Арьяабал хийд", from: "2026.09.27", to: "09.27", days: 1, seats: 12, price: 120000, badge: "ЭРЭЛТТЭЙ", hot: true, route: ["Улаанбаатар", "Мэлхий хад", "Арьяабал хийд", "Улаанбаатар"] },
  { id: 13, kind: "day", scene: "khustai", country: "Төв аймаг", title: "Хустайн нуруу – тахийн ажиглалт", from: "2026.10.04", to: "10.04", days: 1, seats: 14, price: 145000, route: ["Улаанбаатар", "Хустайн нуруу", "Улаанбаатар"] },
  { id: 14, kind: "day", scene: "terelj", country: "Төв аймаг", title: "Чингисийн морьт хөшөө – Горхи-Тэрэлж", from: "2026.10.11", to: "10.11", days: 1, seats: 9, price: 135000, route: ["Улаанбаатар", "Цонжин болдог", "Горхи-Тэрэлж", "Улаанбаатар"] },
];

export const UPCOMING_IDS = [5, 6, 7, 1, 9, 12, 8, 10];

export const SLIDES = [
  { id: 7, eyebrow: "2026 оны 9-р сарын 29-өөс", title: "Хайнан – Сингапур хосолсон аялал" },
  { id: 1, eyebrow: "Үлдэгдэл 2 суудал", title: "Байгал нуур – Эрхүү – Листвянка" },
  { id: 10, eyebrow: "Дотоод аялал · 6 өдөр", title: "Говийн гурван гайхамшиг" },
  { id: 8, eyebrow: "Шууд нислэгтэй", title: "Жанжиажэ: Тэнгэрийн хаалга" },
];

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

export const NEWS = [
  { date: "2026.09.24", title: "Өвлийн улирлын виз мэдүүлэх хугацаа эхэллээ", text: "12-р сард аялах бол визний материалаа 10-р сарын 20-ноос өмнө бүрдүүлэхийг зөвлөж байна." },
  { date: "2026.09.18", title: "Байгал нуурын аялалд паспортын хугацааг шалгаарай", text: "Хилээр гарах өдрөөс хойш 6 сараас дээш хугацаатай паспорт шаардлагатай." },
  { date: "2026.09.10", title: "Цагаан сарын аяллын урьдчилсан бүртгэл нээгдлээ", text: "2027 оны 2-р сарын аяллуудад 10% хямдралтай урьдчилан бүртгүүлэх боломжтой." },
];

export const REVIEWS = [
  { name: "Болормаа", trip: "Хөвсгөл · 3 хоног", text: "Зохион байгуулалт гайхалтай байсан. Хөтөч маань Хөвсгөлийн түүхийг их сонирхолтой ярьсан." },
  { name: "Тэмүүлэн", trip: "Байгал нуур · 6 хоног", text: "Нислэг, буудал, хөтөлбөр бүгд цаг хугацаандаа, төлөвлөгөөний дагуу болсон." },
  { name: "Анударь", trip: "Тэрэлж · өдрийн", text: "Гэр бүлээрээ амрахад их тохиромжтой. Хүүхдүүд маань морь унаад маш их баярласан." },
];

export const VOUCHER_PRICE = 500000;

export const tourById = (id: number) => TOURS.find((t) => t.id === id);

export const fmt = (n: number) => n.toLocaleString("en-US") + "₮";

export const dateRange = (t: Tour) => (t.days === 1 ? t.from : `${t.from} – ${t.to}`);

export const daysLabel = (t: Tour) => (t.days === 1 ? "1 өдөр" : `${t.days} өдөр ${t.days - 1} шөнө`);

export type Filter = { q?: string; kind?: string; month?: string; budget?: string; sort?: string };

export function filterTours({ q, kind, month, budget, sort }: Filter): Tour[] {
  const needle = q?.trim().toLowerCase();
  const list = TOURS.filter((t) => {
    if (needle && !`${t.title} ${t.country} ${t.route.join(" ")}`.toLowerCase().includes(needle)) return false;
    if (kind && t.kind !== kind) return false;
    if (month && Number(t.from.split(".")[1]) !== Number(month)) return false;
    if (budget && t.price > Number(budget)) return false;
    return true;
  });
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => a.from.localeCompare(b.from));
  return list;
}
