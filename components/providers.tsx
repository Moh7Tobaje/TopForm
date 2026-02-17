"use client"

import type { PropsWithChildren } from "react"
import dynamic from 'next/dynamic'
import { LanguageProvider } from "@/contexts/LanguageContext"

// Dynamically import ClerkProvider to make it optional
const ClerkProvider = dynamic(() => import("@clerk/nextjs").then(mod => ({ default: mod.ClerkProvider })), {
  ssr: false,
  loading: () => null
})

const PWAInstallPrompt = dynamic(() => import('@/components/pwa-install-prompt'), {
  ssr: false
})

export default function Providers({ children }: PropsWithChildren) {
  // Check if Clerk is available (environment variables set)
  const isClerkAvailable = typeof window !== 'undefined' && (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY
  )

  if (isClerkAvailable) {
    return (
      <LanguageProvider>
        <ClerkProvider>
          {children}
          <PWAInstallPrompt />
        </ClerkProvider>
      </LanguageProvider>
    )
  }

  // Fallback without Clerk
  console.warn('Clerk not configured, running without authentication')
  return (
    <LanguageProvider>
      {children}
      <PWAInstallPrompt />
    </LanguageProvider>
  )
}



