import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Bebas_Neue, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";
import PageAnimations from "@/components/PageAnimations";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

/* ── Tipografi sistemi: kurumsal kimlik
   Display (büyük başlıklar): Playfair Display — modern editöryel serif
   Serif (alıntı, ikincil): Cormorant Garamond — zarif italik
   Sans (gövde, UI): Inter — okunabilir, modern
   Accent (label, vurgu): Bebas Neue — sıkıştırılmış sans
*/
const fontPlayfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
const fontCormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});
const fontInter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});
const fontBebas = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: { default: "Endamsince Erkek Kuaför", template: "%s | Endamsince" },
  description: "Zonguldak'ın köklü erkek kuaförü. 1979'dan bu yana Endam Plus, Endam Urban ve Endam Junior şubeleriyle saç tasarımı, sakal şekillendirme ve cilt bakımı hizmeti.",
  keywords: "erkek kuaför, berber, Zonguldak berber, Endamsince, Endam Plus, Endam Urban, Endam Junior, saç kesimi, sakal tıraşı",
  manifest: "/manifest.json",
  applicationName: "Endamsince",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Endamsince",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#E8591A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${fontPlayfair.variable} ${fontCormorant.variable} ${fontInter.variable} ${fontBebas.variable}`}
    >
      <body>
        <ServiceWorkerRegister />
        <PageAnimations />
        <LoadingScreen />
        <CustomCursor />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
