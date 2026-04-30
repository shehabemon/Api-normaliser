import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Data Normaliser - JSON to Frontend-Ready Data",
  description:
    "A developer tool to merge, normalize, and transform multiple API JSON responses into frontend-ready data with TypeScript types and React Query hooks.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "API Data Normaliser - JSON to Frontend-Ready Data",
    description:
      "A developer tool to merge, normalize, and transform multiple API JSON responses into frontend-ready data with TypeScript types and React Query hooks.",
    images: [
      {
        url: "/seo-preview-image.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Data Normaliser - JSON to Frontend-Ready Data",
    description:
      "A developer tool to merge, normalize, and transform multiple API JSON responses into frontend-ready data with TypeScript types and React Query hooks.",
    images: ["/seo-preview-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
