import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import ClientWrapper from "../components/ClientWrapper";
import "./globals.css";
import CustomCursor from "../components/CustomCursor";

import Preloader from "../components/Preloader";
import CircularBadge from "../components/CircularBadge";

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortoChef | Premium Culinary Portfolio",
  description: "A premium landing page for culinary experts built with Next.js, GSAP, and Lenis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${serif.variable} ${sans.variable} antialiased selection:bg-obsidian selection:text-white`} suppressHydrationWarning>
        <ClientWrapper>
          <Preloader />
          <CustomCursor />
          <CircularBadge />

          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
