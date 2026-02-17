import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans, Cairo, Tajawal } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import FloatingChatButton from "@/components/floating-chat-button"
import Providers from "@/components/providers"
import LayoutWrapper from "@/components/LayoutWrapper"
import RTLDebugger from "@/components/RTLDebugger"
import { Toaster } from "@/components/ui/toaster"

// Load fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "600", "700"],
  preload: true,
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500"],
  preload: true,
})

// Load Arabic fonts for RTL support
const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "600", "700"],
  preload: true,
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-tajawal",
  weight: ["400", "500", "700"],
  preload: true,
})

export const metadata: Metadata = {
  title: "Top Coach - AI-Powered Fitness Coaching",
  description:
    "Transform your fitness journey with AI-powered coaching, personalized workouts, and smart nutrition planning.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} ${cairo.variable} ${tajawal.variable} antialiased`} dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#e3372e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TopCoach" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/123.svg" />
        <link rel="icon" href="/123.svg" />
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-heading: ${spaceGrotesk.variable};
  --font-body: ${dmSans.variable};
  --font-arabic-primary: ${cairo.style.fontFamily};
  --font-arabic-secondary: ${tajawal.style.fontFamily};
}

html[dir="rtl"] {
  font-family: ${cairo.style.fontFamily}, ${tajawal.style.fontFamily}, system-ui, sans-serif;
}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground circuit-pattern font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <RTLDebugger />
            <FloatingChatButton />
            <Toaster />
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
