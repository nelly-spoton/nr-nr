import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/marginlab/Providers";
import { AppShell } from "@/components/marginlab/AppShell";
import { ScenarioProvider } from "@/components/marginlab/ScenarioProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarginLab — Restaurant Profit Opportunity Calculator",
  description: "SpotOn internal training tool for practicing prime-cost and profit conversations.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Optional webfont; the token font stack falls back to system fonts if blocked. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout: applies to every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>
          <ScenarioProvider>
            <AppShell>{children}</AppShell>
          </ScenarioProvider>
        </Providers>
      </body>
    </html>
  );
}
