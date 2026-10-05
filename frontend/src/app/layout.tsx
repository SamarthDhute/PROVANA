import type { Metadata } from "next";
import { Bebas_Neue, Manrope, Oswald } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import GlobalModals from "@/components/common/GlobalModals";
import Toast from "@/components/common/Toast";
import AiAdvisorWidget from "@/components/ai/AiAdvisorWidget";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const oswald = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-stats",
  display: "swap",
});

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "PROVANA | Fuel A Stronger You — Premium Sports Nutrition",
  description: "Enterprise sports nutrition and fitness performance e-commerce platform. Lab-certified pure whey isolates, micronized creatine, and high-protein nutrition.",
  icons: {
    icon: "/assets/brand-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${manrope.variable} ${oswald.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <StoreProvider>
          <AnnouncementBar />
          <Suspense fallback={<header style={{ height: "72px", backgroundColor: "rgba(11, 12, 14, 0.95)" }} />}>
            <Navbar />
          </Suspense>
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <CartDrawer />
          <GlobalModals />
          <Toast />
          <AiAdvisorWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
