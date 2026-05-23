import type { Metadata } from "next";
import localFont from "next/font/local";
import { jannonText } from "./fonts";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Saga",
  description:
    "Building the future of the internet — founded on creativity, community, and consciousness.",
  icons: {
    icon: "/logo.new.svg",
    apple: "/logo.new.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jannonText.variable} min-h-svh overflow-x-auto antialiased dark`}
      >
        {children}
      </body>
    </html>
  );
}
