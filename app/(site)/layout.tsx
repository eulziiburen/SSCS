import { BookingProvider } from "@/components/Booking";
import { RatesProvider } from "@/components/CurrencyApprox";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCalcSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { rates, ratesDate } = await getCalcSettings();
  return (
    <RatesProvider rates={{ rates, ratesDate }}>
      <BookingProvider>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </BookingProvider>
    </RatesProvider>
  );
}
