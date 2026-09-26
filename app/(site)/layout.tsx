import { BookingProvider } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <BookingProvider>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </BookingProvider>
  );
}
