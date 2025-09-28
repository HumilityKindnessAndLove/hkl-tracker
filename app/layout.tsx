import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import NavBar from "@/components/NavBar";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
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
    <html lang="en" className={ubuntu.variable}>
      <body>
        <Theme
          accentColor="teal"
          grayColor="sage"
          panelBackground="solid"
          radius="full"
        >
          <NavBar />
          <div className="pt-16 md:pt-20 pb-20 md:pb-4">{children}</div>
        </Theme>
      </body>
    </html>
  );
}
