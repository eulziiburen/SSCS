// Country dial codes for the booking forms. Client-safe; the server re-validates with the same rules.

export type DialCode = { code: string; iso: string; flag: string; mn: string; en: string; example?: string };

// Mongolia first, then the countries our tours go to and travelers most often call from
export const DIAL_CODES: DialCode[] = [
  { code: "+976", iso: "MN", flag: "🇲🇳", mn: "Монгол", en: "Mongolia", example: "9911 2233" },
  { code: "+86", iso: "CN", flag: "🇨🇳", mn: "Хятад", en: "China", example: "138 1234 5678" },
  { code: "+7", iso: "RU", flag: "🇷🇺", mn: "ОХУ", en: "Russia", example: "912 345 6789" },
  { code: "+82", iso: "KR", flag: "🇰🇷", mn: "Солонгос", en: "South Korea", example: "10 1234 5678" },
  { code: "+81", iso: "JP", flag: "🇯🇵", mn: "Япон", en: "Japan", example: "90 1234 5678" },
  { code: "+7", iso: "KZ", flag: "🇰🇿", mn: "Казахстан", en: "Kazakhstan", example: "701 234 5678" },
  { code: "+1", iso: "US", flag: "🇺🇸", mn: "АНУ / Канад", en: "USA / Canada", example: "201 555 0123" },
  { code: "+44", iso: "GB", flag: "🇬🇧", mn: "Их Британи", en: "United Kingdom", example: "7400 123456" },
  { code: "+49", iso: "DE", flag: "🇩🇪", mn: "Герман", en: "Germany", example: "1512 3456789" },
  { code: "+33", iso: "FR", flag: "🇫🇷", mn: "Франц", en: "France", example: "6 12 34 56 78" },
  { code: "+90", iso: "TR", flag: "🇹🇷", mn: "Турк", en: "Turkey", example: "501 234 5678" },
  { code: "+61", iso: "AU", flag: "🇦🇺", mn: "Австрали", en: "Australia", example: "412 345 678" },
  { code: "+65", iso: "SG", flag: "🇸🇬", mn: "Сингапур", en: "Singapore", example: "8123 4567" },
  { code: "+852", iso: "HK", flag: "🇭🇰", mn: "Хонконг", en: "Hong Kong", example: "5123 4567" },
  { code: "+853", iso: "MO", flag: "🇲🇴", mn: "Макао", en: "Macau", example: "6612 3456" },
  { code: "+886", iso: "TW", flag: "🇹🇼", mn: "Тайвань", en: "Taiwan", example: "912 345 678" },
  { code: "+66", iso: "TH", flag: "🇹🇭", mn: "Тайланд", en: "Thailand", example: "81 234 5678" },
  { code: "+84", iso: "VN", flag: "🇻🇳", mn: "Вьетнам", en: "Vietnam", example: "91 234 56 78" },
  { code: "+971", iso: "AE", flag: "🇦🇪", mn: "АНЭУ", en: "UAE", example: "50 123 4567" },
  { code: "+48", iso: "PL", flag: "🇵🇱", mn: "Польш", en: "Poland", example: "512 345 678" },
  { code: "+420", iso: "CZ", flag: "🇨🇿", mn: "Чех", en: "Czechia", example: "601 123 456" },
];

export const DEFAULT_DIAL = DIAL_CODES[0];

// The select's value is the ISO code, since +7 is shared by Russia and Kazakhstan
export const dialByIso = (iso: string) => DIAL_CODES.find((d) => d.iso === iso);

export function isValidPhone(iso: string, raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (iso === "MN") return digits.length === 8;
  // E.164 allows up to 15 digits including the country code
  return !!dialByIso(iso) && digits.length >= 6 && digits.length <= 14;
}

// "+976 9911 2233" for Mongolian numbers, "+86 13812345678" otherwise
export function formatPhone(iso: string, raw: string) {
  const d = dialByIso(iso) ?? DEFAULT_DIAL;
  const digits = raw.replace(/\D/g, "");
  return `${d.code} ${iso === "MN" ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits}`;
}
