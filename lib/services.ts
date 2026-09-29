// Extra services offered alongside tours. The order matches home.serviceList in lib/i18n.ts. Client-safe.

export const SERVICE_KEYS = ["sim", "stay", "bus", "guide", "photo"] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export const SERVICE_ICON: Record<ServiceKey, string> = { sim: "📶", stay: "⛺", bus: "🚌", guide: "🧭", photo: "📷" };

// Mongolian names for the admin's booking list
export const SERVICE_MN: Record<ServiceKey, string> = { sim: "Дата сим", stay: "Байрлах газар", bus: "Автобус түрээс", guide: "Хөтөч", photo: "Зурагчин" };

export const isServiceKey = (v: unknown): v is ServiceKey => (SERVICE_KEYS as readonly unknown[]).includes(v);
