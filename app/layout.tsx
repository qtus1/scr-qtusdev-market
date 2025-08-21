import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QtusDevMarket - Digital Products Marketplace",
  description: "Discover and purchase high-quality digital products, tools, and resources for developers and creators.",
  keywords: ["digital products", "marketplace", "developers", "tools", "resources"],
  authors: [{ name: "QtusDevMarket" }],
  creator: "QtusDevMarket",
  publisher: "QtusDevMarket",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://qtusdevmarket.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QtusDev Market - Digital Products Marketplace",
    description:
      "Discover and purchase high-quality digital products, tools, and resources for developers and creators.",
    url: "/",
    siteName: "QtusDevMarket",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QtusDev Market - Digital Products Marketplace",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QtusDev Market - Digital Products Marketplace",
    description:
      "Discover and purchase high-quality digital products, tools, and resources for developers and creators.",
    images: ["/og-image.png"],
    creator: "@qtusdevmarket",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logoqtusdev.png" />
        <link rel="apple-touch-icon" href="/logoqtusdev.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QtusDevMarket" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
