import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";
import PageAnimations from "@/components/PageAnimations";

export const metadata: Metadata = {
  title: { default: "Endamsince Erkek Kuaför", template: "%s | Endamsince" },
  description: "Zonguldak'ın köklü erkek kuaförü. 1979'dan bu yana Endam Plus, Endam Urban ve Endam Junior şubeleriyle saç tasarımı, sakal şekillendirme ve cilt bakımı hizmeti.",
  keywords: "erkek kuaför, berber, Zonguldak berber, Endamsince, Endam Plus, Endam Urban, Endam Junior, saç kesimi, sakal tıraşı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
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
