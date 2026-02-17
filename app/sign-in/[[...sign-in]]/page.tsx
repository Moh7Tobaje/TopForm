"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen circuit-pattern-dense bg-background flex items-center justify-center p-4">
      <SignIn />
    </div>
  )
}



