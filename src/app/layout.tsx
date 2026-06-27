import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Engineer World's Fair 2026 — Session Explorer",
  description: "Browse, search, and bookmark sessions and speakers for AI Engineer World's Fair 2026 in San Francisco. 556 sessions, 526 speakers, 39 tracks across 4 days.",
  keywords: ["AI Engineer", "World's Fair 2026", "AI conference", "sessions", "speakers", "San Francisco", "Moscone"],
  authors: [{ name: "AI Engineer" }],
  openGraph: {
    title: "AI Engineer World's Fair 2026 — Session Explorer",
    description: "Browse 556 sessions and 526 speakers across 4 days of the world's largest AI engineering conference.",
    url: "https://ai.engineer/worldsfair",
    siteName: "AI Engineer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Engineer World's Fair 2026 — Session Explorer",
    description: "Browse 556 sessions and 526 speakers across 4 days of the world's largest AI engineering conference.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
