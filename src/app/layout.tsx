import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import Script from "next/script";

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
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rkfabricszone.com"),
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
  verification: {
    other: {
      "msvalidate.01": "79E679E6698B658820E6B91730C8E531",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

const toastOptions = {
  style: {
    fontFamily: "var(--font-inter)",
  },
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
  <head>
    <Script
      id="ld-json"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.rkfabricszone.com/#organization",
              "name": "RK Fabrics Zone",
              "url": "https://www.rkfabricszone.com/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.rkfabricszone.com/logo.png"
              },
              "sameAs": [
                "https://www.instagram.com/rkfabricszone/",
                "https://www.facebook.com/rkfabricszone/"
              ]
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://www.rkfabricszone.com/#localbusiness",
              "name": "RK Fabrics Zone",
              "image": "https://www.rkfabricszone.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Jaipur",
                "addressRegion": "Rajasthan",
                "addressCountry": "IN"
              }
            },
            {
              "@type": "WebSite",
              "@id": "https://www.rkfabricszone.com/#website",
              "url": "https://www.rkfabricszone.com/",
              "name": "RK Fabrics Zone",
              "publisher": {
                "@id": "https://www.rkfabricszone.com/#organization"
              }
            }
          ]
        })
      }}
    />
  </head>
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
  
  <ConditionalFooter>
    <Footer />
  </ConditionalFooter>
  
  <HideOnAllPortal>
    <MobileNav />

  </HideOnAllPortal>
 <Toaster
 position="top-center"
 richColors
 toastOptions={toastOptions}
 />
 </ThemeProvider>
 </body>
 </html>
 );
}
