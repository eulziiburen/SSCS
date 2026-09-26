import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getI18n } from "@/lib/locale";
import "./globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["500", "700", "800"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["500", "700"], variable: "--font-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.title, template: "%s · Soft Travel" },
    description: t.meta.description,
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1222" },
  ],
};

// Runs before first paint: data-theme-pref drives which switch button looks active,
// data-theme (only for an explicit choice) overrides the OS color scheme
const THEME_SCRIPT = `(function(){var p="system";try{p=localStorage.getItem("theme")||"system"}catch(e){}var r=document.documentElement;r.dataset.themePref=p;if(p==="light"||p==="dark")r.dataset.theme=p})()`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getI18n();
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#main">
          {t.nav.skip}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
