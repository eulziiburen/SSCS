import { BookingProvider } from "@/components/Booking";
import { RatesProvider } from "@/components/CurrencyApprox";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { UserProvider, type SessionUser } from "@/components/UserProvider";
import { dialByIso } from "@/lib/phone";
import { getCalcSettings } from "@/lib/queries";
import { getCurrentUser } from "@/lib/user-auth";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [{ rates, ratesDate }, u] = await Promise.all([
    getCalcSettings(),
    getCurrentUser(),
  ]);
  // National number only; the form shows the country code separately
  const sessionUser: SessionUser | null = u && {
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneIso: u.phoneIso,
    phone: u.phone
      .slice((dialByIso(u.phoneIso)?.code ?? "").length)
      .replace(/\D/g, ""),
  };
  return (
    <UserProvider user={sessionUser}>
      <RatesProvider rates={{ rates, ratesDate }}>
        <BookingProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </BookingProvider>
      </RatesProvider>
    </UserProvider>
  );
}
