import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  themeColor: "#000000",
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
        className={`${outfit.variable} ${dmSans.variable} ${geistMono.variable} antialiased bg-black text-[#a1a1a1] min-h-screen`}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "rgba(10, 10, 10, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#ededed",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
