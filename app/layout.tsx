import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Rye } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rye = Rye({
  weight: "400",
  variable: "--font-western",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixIt AI — UDel Campus Maintenance",
  description:
    "AI-powered campus maintenance reporting for University of Delaware",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FixIt AI",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rye.variable} antialiased bg-[#0d0a07] text-[#f4e4c1] min-h-screen grain-overlay`}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#231c14",
              border: "1px solid #3d3124",
              color: "#f4e4c1",
            },
          }}
        />
      </body>
    </html>
  );
}
