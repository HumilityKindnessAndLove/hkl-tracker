import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HKL Tracker",
  description: "Volunteer interaction tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <Theme>
          <NavBar />
          <div className="pt-16 md:pt-20 pb-20 md:pb-4">{children}</div>
        </Theme>
      </body>
    </html>
  );
}
