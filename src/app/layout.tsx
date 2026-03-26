import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

const sansThai = IBM_Plex_Sans_Thai({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sans-thai",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบบริหารจัดการ Sci-Park",
  description: "แพลตฟอร์มบริหารโครงการนวัตกรรมแบบครบวงจร",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sansThai.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans-thai font-light">
        <TooltipProvider>
          {children}
          <Toaster position="top-right" closeButton richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
