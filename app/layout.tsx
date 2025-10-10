import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import ContentWrapper from "@/components/ContentWrapper";
import PWAInstaller from "@/components/PWAInstaller";
import { ThemeProvider } from "@/components/theme-provider";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "HKL Tracker",
  description: "A tool for canvassers to track interactions with the public.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HKL Tracker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ubuntu.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body suppressHydrationWarning>
        <PWAInstaller />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ContentWrapper>{children}</ContentWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
