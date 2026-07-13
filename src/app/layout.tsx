import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | SNIE",
    default: "SNIE — Students Network for International Exchange",
  },
  description:
    "We connect students worldwide through cultural exchange, language learning, and international collaboration.",
  openGraph: {
    title: "SNIE — Students Network for International Exchange",
    description:
      "We connect students worldwide through cultural exchange, language learning, and international collaboration.",
    siteName: "SNIE Portal",
    locale: "ja_JP",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
