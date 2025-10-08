import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import ContentWrapper from "@/components/ContentWrapper";
import PWAInstaller from "@/components/PWAInstaller";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "HKL Tracker",
  description: "A tool for canvassers to track interactions with the public.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HKL Tracker",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <PWAInstaller />
        <Theme
          accentColor="teal"
          grayColor="sage"
          panelBackground="solid"
          radius="full"
          scaling="110%"
        >
          <ContentWrapper>{children}</ContentWrapper>
        </Theme>
      </body>
    </html>
  );
}
