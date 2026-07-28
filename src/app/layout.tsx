import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

import { AuthHydration } from "@/components/layout/auth-hydration";
import { CartSync } from "@/components/cart-sync";
import { NavigationLoader } from "@/components/layout/navigation-loader";
import { Toaster } from "sonner";
import { getAnnouncementBanner } from "@/actions/system";
import { getNavigationLinksData } from "@/lib/data/system";
import { HideOnMobilePortal, HideOnAllPortal, PortalMainWrapper } from "@/components/layout/global-layout-wrapper";
import "./globals.css";

const playfair = Playfair_Display({
 variable: "--font-playfair",
 subsets: ["latin"],
 display: "swap",
 weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
 display: "swap",
 weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
 variable: "--font-cinzel",
 subsets: ["latin"],
 display: "swap",
 weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
 title: {
 default: "RK Fabrics Zone — Premium Fabrics & Stylish Fashion | Jaipur",
 template: "%s | RK Fabrics Zone",
 },
 description:
 "Discover premium quality fabrics, designer ethnic wear, and stylish fashion for men & women at RK Fabrics Zone, Jaipur. Manufacturer & direct seller of silk, cotton, linen, and more.",
 keywords: [
 "RK Fabrics Zone",
 "fabrics",
 "sarees",
 "ethnic wear",
 "Jaipur",
 "silk",
 "cotton",
 "designer clothing",
 "men's wear",
 "women's wear",
 "Indian fashion",
 ],
 authors: [{ name: "RK Fabrics Zone" }],
 creator: "RK Fabrics Zone",
 openGraph: {
 type: "website",
 locale: "en_IN",
 siteName: "RK Fabrics Zone",
 title: "RK Fabrics Zone — Premium Fabrics & Stylish Fashion",
 description:
 "Manufacturer & direct seller of premium fabrics and designer clothing from Jaipur, India.",
 images: [{ url: "/logo.png", width: 1024, height: 1024 }],
 },
 twitter: {
 card: "summary_large_image",
 title: "RK Fabrics Zone",
 description: "Premium Fabrics | Stylish You — From Jaipur, India",
 },
 robots: {
 index: true,
 follow: true,
 },
 appleWebApp: {
    title: "RK Fabrics",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default async function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const navLinks = await getNavigationLinksData();
 const announcementBanner = await getAnnouncementBanner();
 return (
 <html
 lang="en"
 className={`${playfair.variable} ${inter.variable} ${cinzel.variable}`}
 suppressHydrationWarning
 >
 <body className="min-h-screen flex flex-col antialiased bg-gradient-to-br from-teal-50 via-[#fdfaf6] to-blue-50/50">
 <ThemeProvider
 attribute="class"
 defaultTheme="light"
 forcedTheme="light"
 enableSystem={false}
 disableTransitionOnChange={false}
 >
  <HideOnMobilePortal>
    <Header initialNavLinks={navLinks} announcementBanner={announcementBanner} />
  </HideOnMobilePortal>
  
  <NavigationLoader />
  <AuthHydration />
  <CartSync />
  
  <PortalMainWrapper>
    {children}
  </PortalMainWrapper>
  
  <Footer />
  
  <HideOnAllPortal>
    <MobileNav />

  </HideOnAllPortal>
 <Toaster
 position="top-center"
 richColors
 toastOptions={{
 style: {
 fontFamily: "var(--font-inter)",
 },
 }}
 />
 </ThemeProvider>
 </body>
 </html>
 );
}
