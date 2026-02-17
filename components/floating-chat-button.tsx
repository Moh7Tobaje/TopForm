"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

export default function FloatingChatButton() {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  // Hide the button on the chat page and on mobile (since we have bottom nav)
  useEffect(() => {
    setIsVisible(pathname !== '/chat')
  }, [pathname])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-8 z-50">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced pulsing ring animations */}
        <div className="absolute inset-0 rounded-full bg-[#e3372e]/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full bg-[#e3372e]/30 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-[#e3372e]/10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <Link href="/chat">
          <Button
            size="lg"
            className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[#e3372e] to-[#c41e3a] hover:from-[#e3372e]/90 hover:to-[#c41e3a]/90 text-white shadow-2xl glow-red transition-all duration-500 hover:scale-110 hover:rotate-3 border-2 border-white/20 floating-button-bounce"
          >
            <div className="flex items-center justify-center">
              <Image
                src="/images/top-coach-logo.svg"
                alt="AI Coach"
                width={88}
                height={88}
                className="rounded-full filter drop-shadow-lg logo-message"
              />
            </div>
          </Button>
        </Link>

        {/* Enhanced notification badge */}
        <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-[#e3372e] to-[#ff6b6b] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div className="h-2.5 w-2.5 bg-white rounded-full animate-pulse"></div>
        </div>

        {/* Enhanced tooltip with better visibility */}
        <div className={`absolute bottom-full right-0 mb-3 px-4 py-2 bg-[#2d2e2e]/95 backdrop-blur-sm text-white text-sm rounded-xl border border-[#e3372e]/30 transition-all duration-300 whitespace-nowrap shadow-xl ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#e3372e]" />
            <span className="font-medium">Chat with AI Coach</span>
          </div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2d2e2e]/95"></div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#e3372e] rounded-full particle-float opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#e3372e] rounded-full particle-float opacity-40" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#e3372e] rounded-full particle-float opacity-50" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  )
}
