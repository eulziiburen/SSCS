import type { news, tours } from "./schema";

type TourSeed = typeof tours.$inferInsert;

const r = (...stops: string[]) => JSON.stringify(stops);

export const SEED_TOURS: TourSeed[] = [
  { kind: "abroad", scene: "baikal", country: "ОХУ", title: "Байгал нуур – Эрхүү хотын аялал", startDate: "2026-09-30", endDate: "2026-10-05", seats: 2, price: 900000, badge: "ОНЦЛОХ", route: r("Улаанбаатар", "Эрхүү", "Листвянка", "Улаанбаатар"), featured: true, heroEyebrow: "Үлдэгдэл 2 суудал", upcoming: true },
  { kind: "abroad", scene: "shanghai", country: "БНХАУ", title: "Шанхай хотын шууд нислэгтэй аялал (Диснейлэндтэй)", startDate: "2026-10-29", endDate: "2026-11-03", seats: 4, price: 3590000, badge: "ЭРЭЛТТЭЙ", hot: true, route: r("Улаанбаатар", "Шанхай", "Диснейлэнд", "Улаанбаатар") },
  { kind: "abroad", scene: "canton", country: "БНХАУ", title: "Canton Fair 2026: Гуанжоу – Макао", startDate: "2026-10-13", endDate: "2026-10-21", seats: 2, price: 2750000, badge: "ОНЦЛОХ", route: r("Улаанбаатар", "Гуанжоу", "Макао", "Улаанбаатар") },
  { kind: "abroad", scene: "seoul", country: "БНСУ", title: "Сөүл – Жэжү намрын аялал", startDate: "2026-11-06", endDate: "2026-11-12", seats: 6, price: 2890000, route: r("Улаанбаатар", "Сөүл", "Жэжү", "Улаанбаатар") },
  { kind: "abroad", scene: "manzhouli", country: "БНХАУ", title: "Манжуур хотын шууд нислэгтэй аялал · 4 шөнө 5 өдөр", startDate: "2026-09-26", endDate: "2026-09-30", seats: 5, price: 1080000, route: r("Улаанбаатар", "Манжуур", "Улаанбаатар"), upcoming: true },
  { kind: "abroad", scene: "hainan", country: "БНХАУ", title: "Хайнан арлын аялал", startDate: "2026-09-29", endDate: "2026-10-05", seats: 4, price: 2590000, route: r("Улаанбаатар", "Хайкоу", "Саняа", "Улаанбаатар"), upcoming: true },
  { kind: "abroad", scene: "hainan", country: "БНХАУ · Сингапур", title: "Хайнан – Сингапур хосолсон аялал", startDate: "2026-09-29", endDate: "2026-10-06", seats: 4, price: 5900000, badge: "ОНЦЛОХ", route: r("Улаанбаатар", "Хайкоу", "Сингапур", "Саняа", "Улаанбаатар"), featured: true, heroEyebrow: "2026 оны 9-р сарын 29-өөс", upcoming: true },
  { kind: "abroad", scene: "zhangjiajie", country: "БНХАУ", title: "Чунчин – Жанжиажэ шууд нислэгтэй аялал", startDate: "2026-10-18", endDate: "2026-10-24", seats: 8, price: 3150000, route: r("Улаанбаатар", "Чунчин", "Жанжиажэ", "Улаанбаатар"), featured: true, heroEyebrow: "Шууд нислэгтэй", upcoming: true },
  { kind: "local", scene: "khuvsgul", country: "Хөвсгөл", title: "Хөвсгөл нуур – Хатгал тосгон", startDate: "2026-10-02", endDate: "2026-10-04", seats: 10, price: 690000, badge: "ЭРЭЛТТЭЙ", hot: true, route: r("Улаанбаатар", "Мөрөн", "Хатгал", "Улаанбаатар"), upcoming: true },
  { kind: "local", scene: "gobi", country: "Өмнөговь", title: "Хонгорын элс – Ёлын ам – Баянзаг", startDate: "2026-10-08", endDate: "2026-10-13", seats: 7, price: 1450000, badge: "ОНЦЛОХ", route: r("Улаанбаатар", "Даланзадгад", "Ёлын ам", "Хонгорын элс", "Баянзаг", "Улаанбаатар"), featured: true, heroEyebrow: "Дотоод аялал · 6 өдөр", upcoming: true },
  { kind: "local", scene: "altai", country: "Баян-Өлгий", title: "Алтай Таван Богд – Бүргэдийн баяр", startDate: "2026-10-03", endDate: "2026-10-09", seats: 3, price: 2350000, route: r("Улаанбаатар", "Өлгий", "Таван Богд", "Улаанбаатар") },
  { kind: "day", scene: "terelj", country: "Төв аймаг", title: "Тэрэлж – Мэлхий хад – Арьяабал хийд", startDate: "2026-09-27", endDate: "2026-09-27", seats: 12, price: 120000, badge: "ЭРЭЛТТЭЙ", hot: true, route: r("Улаанбаатар", "Мэлхий хад", "Арьяабал хийд", "Улаанбаатар"), upcoming: true },
  { kind: "day", scene: "khustai", country: "Төв аймаг", title: "Хустайн нуруу – тахийн ажиглалт", startDate: "2026-10-04", endDate: "2026-10-04", seats: 14, price: 145000, route: r("Улаанбаатар", "Хустайн нуруу", "Улаанбаатар") },
  { kind: "day", scene: "terelj", country: "Төв аймаг", title: "Чингисийн морьт хөшөө – Горхи-Тэрэлж", startDate: "2026-10-11", endDate: "2026-10-11", seats: 9, price: 135000, route: r("Улаанбаатар", "Цонжин болдог", "Горхи-Тэрэлж", "Улаанбаатар") },
];

export const SEED_NEWS: (typeof news.$inferInsert)[] = [
  { date: "2026-09-24", title: "Өвлийн улирлын виз мэдүүлэх хугацаа эхэллээ", text: "12-р сард аялах бол визний материалаа 10-р сарын 20-ноос өмнө бүрдүүлэхийг зөвлөж байна." },
  { date: "2026-09-18", title: "Байгал нуурын аялалд паспортын хугацааг шалгаарай", text: "Хилээр гарах өдрөөс хойш 6 сараас дээш хугацаатай паспорт шаардлагатай." },
  { date: "2026-09-10", title: "Цагаан сарын аяллын урьдчилсан бүртгэл нээгдлээ", text: "2027 оны 2-р сарын аяллуудад 10% хямдралтай урьдчилан бүртгүүлэх боломжтой." },
];

// English copy for the seed content, keyed by the Mongolian title. Also used to backfill
// databases created before the English columns existed.
export const SEED_TOURS_EN: Record<string, { titleEn: string; countryEn: string; routeEn: string; heroEyebrowEn?: string }> = {
  "Байгал нуур – Эрхүү хотын аялал": { titleEn: "Lake Baikal & Irkutsk", countryEn: "Russia", routeEn: r("Ulaanbaatar", "Irkutsk", "Listvyanka", "Ulaanbaatar"), heroEyebrowEn: "Only 2 seats left" },
  "Шанхай хотын шууд нислэгтэй аялал (Диснейлэндтэй)": { titleEn: "Shanghai by direct flight (with Disneyland)", countryEn: "China", routeEn: r("Ulaanbaatar", "Shanghai", "Disneyland", "Ulaanbaatar") },
  "Canton Fair 2026: Гуанжоу – Макао": { titleEn: "Canton Fair 2026: Guangzhou & Macau", countryEn: "China", routeEn: r("Ulaanbaatar", "Guangzhou", "Macau", "Ulaanbaatar") },
  "Сөүл – Жэжү намрын аялал": { titleEn: "Seoul & Jeju in autumn", countryEn: "South Korea", routeEn: r("Ulaanbaatar", "Seoul", "Jeju", "Ulaanbaatar") },
  "Манжуур хотын шууд нислэгтэй аялал · 4 шөнө 5 өдөр": { titleEn: "Manzhouli by direct flight · 5 days, 4 nights", countryEn: "China", routeEn: r("Ulaanbaatar", "Manzhouli", "Ulaanbaatar") },
  "Хайнан арлын аялал": { titleEn: "Hainan Island", countryEn: "China", routeEn: r("Ulaanbaatar", "Haikou", "Sanya", "Ulaanbaatar") },
  "Хайнан – Сингапур хосолсон аялал": { titleEn: "Hainan & Singapore combo", countryEn: "China · Singapore", routeEn: r("Ulaanbaatar", "Haikou", "Singapore", "Sanya", "Ulaanbaatar"), heroEyebrowEn: "From 29 September 2026" },
  "Чунчин – Жанжиажэ шууд нислэгтэй аялал": { titleEn: "Chongqing & Zhangjiajie by direct flight", countryEn: "China", routeEn: r("Ulaanbaatar", "Chongqing", "Zhangjiajie", "Ulaanbaatar"), heroEyebrowEn: "Direct flight" },
  "Хөвсгөл нуур – Хатгал тосгон": { titleEn: "Lake Khuvsgul & Khatgal village", countryEn: "Khuvsgul", routeEn: r("Ulaanbaatar", "Murun", "Khatgal", "Ulaanbaatar") },
  "Хонгорын элс – Ёлын ам – Баянзаг": { titleEn: "Khongor Dunes, Yolyn Am & Bayanzag", countryEn: "Umnugovi", routeEn: r("Ulaanbaatar", "Dalanzadgad", "Yolyn Am", "Khongor Dunes", "Bayanzag", "Ulaanbaatar"), heroEyebrowEn: "Domestic · 6 days" },
  "Алтай Таван Богд – Бүргэдийн баяр": { titleEn: "Altai Tavan Bogd & Golden Eagle Festival", countryEn: "Bayan-Ulgii", routeEn: r("Ulaanbaatar", "Ulgii", "Tavan Bogd", "Ulaanbaatar") },
  "Тэрэлж – Мэлхий хад – Арьяабал хийд": { titleEn: "Terelj, Turtle Rock & Aryabal Temple", countryEn: "Tuv province", routeEn: r("Ulaanbaatar", "Turtle Rock", "Aryabal Temple", "Ulaanbaatar") },
  "Хустайн нуруу – тахийн ажиглалт": { titleEn: "Khustai National Park: wild horse watching", countryEn: "Tuv province", routeEn: r("Ulaanbaatar", "Khustai National Park", "Ulaanbaatar") },
  "Чингисийн морьт хөшөө – Горхи-Тэрэлж": { titleEn: "Chinggis Khaan Equestrian Statue & Gorkhi-Terelj", countryEn: "Tuv province", routeEn: r("Ulaanbaatar", "Tsonjin Boldog", "Gorkhi-Terelj", "Ulaanbaatar") },
};

export const SEED_NEWS_EN: Record<string, { titleEn: string; textEn: string }> = {
  "Өвлийн улирлын виз мэдүүлэх хугацаа эхэллээ": { titleEn: "Winter visa applications are now open", textEn: "If you're traveling in December, we recommend submitting your visa documents before 20 October." },
  "Байгал нуурын аялалд паспортын хугацааг шалгаарай": { titleEn: "Check your passport before a Baikal trip", textEn: "Your passport must be valid for more than 6 months after the date you cross the border." },
  "Цагаан сарын аяллын урьдчилсан бүртгэл нээгдлээ": { titleEn: "Early booking for Lunar New Year trips is open", textEn: "Book February 2027 trips early and get 10% off." },
};
