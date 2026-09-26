import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { BookingProvider } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["500", "700", "800"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["500", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Тал Аялал — Гадаад, дотоод аялал", template: "%s · Тал Аялал" },
  description: "Монгол орон болон дэлхийн өнцөг булан бүрээр тухтай, найдвартай аялуулна. Гадаад, дотоод, өдрийн аяллууд.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F6F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1720" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Үндсэн агуулга руу шилжих
        </a>
        <BookingProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </BookingProvider>
      </body>
    </html>
  );
}
