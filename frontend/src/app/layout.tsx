import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MagneticCursor from "@/components/effects/MagneticCursor";
import GTMTracking from "@/providers/analytics/GTMTracking";
import SmothScrollProvider from "@/providers/SmothScrollProvider";
import LandingNavigation from "@/features/shared/components/navigation/LandingNavigation";
import LandingAssistants from "@/features/shared/components/assistants/LandingAssistants";
import PageTransitionProvider from "@/components/providers/page-transition/TransitionProvider";
import "../features/shared/components/navigation/staggered-menu/navbar.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Viajes Premium",
    template: "%s | Viajes Premium",
  },
  description: "Landings premium por destino para Japón, Corea, Europa y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GTMTracking />
        <SmothScrollProvider>
          <MagneticCursor>
            <PageTransitionProvider>
              <LandingNavigation />
              {children}
              <LandingAssistants />
            </PageTransitionProvider>
          </MagneticCursor>
        </SmothScrollProvider>
      </body>
    </html>
  );
}
