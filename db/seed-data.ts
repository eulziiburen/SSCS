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
