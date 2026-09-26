"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("mn");

// Only the locale crosses the server/client boundary; the dictionary (which holds functions) is looked up here
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: getDictionary(locale) };
}
