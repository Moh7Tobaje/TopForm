"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Mic, Paperclip, MoreVertical, ArrowLeft, Zap, Target, Apple, TrendingUp, Dumbbell, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useLanguage } from "@/contexts/LanguageContext"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "workout" | "nutrition" | "progress"
}

interface MatchedExercise {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // New: exercise matches UI state
  const [matchedExercises, setMatchedExercises] = useState<MatchedExercise[]>([])
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check authentication and load messages
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }

    if (isLoaded && user) {
      // Load conversation history
      fetch('/api/chat', { method: 'GET' })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load messages: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            const formattedMessages: Message[] = data.messages
              .map((msg: any, i: number, arr: any[]) => {
                // Use server timestamp if present; otherwise, synthesize a stable
                // chronological timestamp based on the array order so we can sort reliably.
                // If server sends newest-first, this makes older messages smaller (earlier) values.
                const fallbackTs = new Date(0 + (arr.length - i))
                const ts = msg.timestamp ? new Date(msg.timestamp) : fallbackTs
                return {
                  id: `msg-${msg.id || Date.now()}-${Math.random()}`,
                  content: msg.content,
                  sender: msg.role === 'user' ? 'user' : 'ai',
                  timestamp: ts,
                } as Message
              })
              // Ensure chronological order: oldest first, newest last
              .sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getTime())

            setMessages(formattedMessages)
          } else {
            // Add welcome message for new users
            setMessages([{
              id: "welcome-msg",
              content: t('chat.welcomeMessage'),
              sender: "ai",
              timestamp: new Date(),
            }])
          }
        })
        .catch(error => {
          console.error('Error loading messages:', error)
          // Add welcome message as fallback
          setMessages([{
            id: "welcome-msg",
            content: t('chat.welcomeMessage'),
            sender: "ai",
            timestamp: new Date(),
          }])
        })
    }
  }, [isLoaded, user, router])

  // After messages change, detect exercises in the last AI message
  useEffect(() => {
    const lastAi = [...messages].reverse().find(m => m.sender === 'ai')
    if (!lastAi) {
      setMatchedExercises([])
      return
    }
    const abort = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/exercises/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: lastAi.content }),
          signal: abort.signal,
        })
        if (!res.ok) throw new Error('exercise search failed')
        const data = await res.json()
        setMatchedExercises(Array.isArray(data.results) ? data.results : [])
      } catch (e) {
        console.error('exercise detection error', e)
        setMatchedExercises([])
      }
    })()
    return () => abort.abort()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return


    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Create a temporary AI message for streaming with typing indicator
    const tempAiMessage: Message = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: "▍", // Typing indicator
      sender: "ai",
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, tempAiMessage])

    try {
      // Use EventSource for streaming
      const eventSource = new EventSource('/api/chat-streaming?' + new URLSearchParams({
        message: inputValue
      }).toString())

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.error) {
            console.error('Streaming error:', data.error)
            setMessages((prev) => 
              prev.map(msg => 
                msg.id === tempAiMessage.id 
                  ? { ...msg, content: t('chat.error') }
                  : msg
              )
            )
            setIsTyping(false)
            eventSource.close()
            return
          }

          if (data.done) {
            setIsTyping(false)
            
            // Get final content
            const finalContent = messages.find(msg => msg.id === tempAiMessage.id)?.content || ""
            
            eventSource.close()
            return
          }

          // Update AI message immediately with new chunk
          setMessages((prev) => {
            const currentMessage = prev.find(msg => msg.id === tempAiMessage.id)
            const currentContent = currentMessage?.content || ""
            const newContent = currentContent === "▍" ? data.chunk : currentContent + data.chunk
            
            return prev.map(msg => 
              msg.id === tempAiMessage.id 
                ? { ...msg, content: newContent }
                : msg
            )
          })
          
          // Auto-scroll to show new content
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 10)
          
        } catch (error) {
          console.error('Error parsing streaming data:', error)
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === tempAiMessage.id 
                ? { ...msg, content: t('chat.error') }
                : msg
            )
          )
          setIsTyping(false)
          eventSource.close()
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === tempAiMessage.id 
              ? { ...msg, content: t('chat.error') }
              : msg
          )
        )
        setIsTyping(false)
        eventSource.close()
      }

    } catch (error) {
      console.error('Error starting streaming:', error)
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempAiMessage.id 
            ? { ...msg, content: t('chat.error') }
            : msg
        )
      )
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    if (!user) return
    setInputValue(action)
  }

  const quickActions = [
    { icon: Zap, text: t('actions.generateWorkoutPlan'), action: "Can you create a workout plan for me?" },
    { icon: Apple, text: t('actions.mealSuggestionsQuick'), action: "What should I eat today?" },
    { icon: Target, text: t('actions.setGoals'), action: "Help me set some fitness goals" },
    { icon: TrendingUp, text: t('actions.trackProgressQuick'), action: "How can I track my progress?" },
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#091110] text-white circuit-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e3372e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg[#091110] text-white circuit-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">{t('chat.signInRequired')}</p>
          <Link href="/sign-in">
            <Button className="gradient-red-silver glow-red">
              {t('nav.signIn')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091110] text-white circuit-pattern">
      {/* Header */}
      <div className="border-b border-[#2d2e2e]/30 bg-[#091110]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 md:p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#e3372e]/20 text-[#e3372e] border border-[#e3372e]/30 hover:border-[#e3372e]/50 transition-all duration-300 w-8 h-8 md:w-10 md:h-10"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative logo-container">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="AI Coach"
                  width={48}
                  height={48}
                  className="rounded-xl border-2 border-[#e3372e]/50 logo-header shadow-lg md:w-14 md:h-14"
                  priority
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-[#e3372e] rounded-full border-2 border-[#091110] animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-base md:text-lg bg-gradient-to-r from-[#e3372e] to-white bg-clip-text text-transparent">
                  {t('chat.title')}
                </h1>
                <p className="text-xs md:text-sm text-[#2d2e2e]">{t('chat.online')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-[#2d2e2e] hidden md:block">{t('chat.welcome')}, {user.firstName || user.username || 'User'}</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 max-w-4xl mx-auto pb-24 md:pb-20">
        <div className="space-y-4 md:space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="AI Coach"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-[#e3372e]/40 flex-shrink-0 logo-message shadow-md md:w-10 md:h-10"
                />
              )}

              <div className={`max-w-[85%] md:max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                <Card
                  className={`p-3 md:p-4 border-0 ${
                    message.sender === "user"
                      ? "bg-[#e3372e] text-white ml-auto glow-red"
                      : "bg-[#2d2e2e]/80 border-[#2d2e2e]/50 text-white backdrop-blur-sm"
                  }`}
                >
                  <div className="text-sm md:text-base leading-relaxed">
                    <MarkdownRenderer content={message.content} />
                  </div>
                </Card>
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#2d2e2e]/80 flex items-center justify-center flex-shrink-0 border border-[#e3372e]/30">
                  <span className="text-xs font-medium text-white">You</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Image
                src="/images/top-coach-logo.svg"
                alt="AI Coach"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#e3372e]/40 flex-shrink-0 logo-message shadow-md"
              />
              <Card className="p-4 bg-[#2d2e2e]/80 border-[#2d2e2e]/50 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border[#2d2e2e]/30 bg-[#091110]/90 backdrop-blur-sm p-3 md:p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute left-1 top-1 h-6 w-6 md:h-8 md:w-8 bg-[#e3372e] hover:bg-[#e3372e]/80 text-white z-10"
                disabled={!inputValue.trim()}
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="pl-8 md:pl-12 bg-[#2d2e2e]/50 border-[#2d2e2e]/50 focus:border-[#e3372e]/50 text-white placeholder:text[#2d2e2e] backdrop-blur-sm text-sm md:text-base h-10 md:h-12"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>

            {/* Dumbbell button appears only if there are exercise matches */}
            {matchedExercises.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-10 md:h-12 px-3 md:px-4 border-[#e3372e]/50 text-white hover:bg-[#e3372e]/20"
                onClick={() => setIsExerciseModalOpen(true)}
                title="Show exercises from last answer"
              >
                <Dumbbell className="h-4 w-4 text-[#e3372e]" />
                <span className="hidden sm:inline text-sm">{t('chat.showExercises')}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center mt-2 space-x-2">
            <Badge variant="secondary" className="text-xs bg-[#2d2e2e]/50 text-white border-[#e3372e]/30">
              {t('chat.secureBadge')}
            </Badge>
            
          </div>
        </div>
      </div>

      {/* Exercises Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-3 md:p-6" onClick={() => setIsExerciseModalOpen(false)}>
          <div className="w-full max-w-2xl bg-[#0b1413] border border-[#2d2e2e]/60 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-[#2d2e2e]/60">
              <h3 className="text-base md:text-lg font-semibold">{t('chat.exercisesModal')}</h3>
              <Button size="icon" variant="ghost" className="text-white hover:bg-[#e3372e]/20" onClick={() => setIsExerciseModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {matchedExercises.map((ex) => (
                <Card key={ex.exerciseId} className="p-3 md:p-4 bg-[#111918] border-[#2d2e2e]/60">
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="md:w-56 w-full">
                      <Image src={ex.gifUrl} alt={ex.name} width={224} height={224} className="rounded-lg border border-[#2d2e2e]/50 bg-black object-cover w-full h-auto" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{ex.name}</h4>
                      {(ex.targetMuscles?.length || ex.secondaryMuscles?.length) && (
                        <p className="text-xs md:text-sm text-[#b9c0bf] mb-2">
                          <span className="font-medium text-white">{t('chat.targets')}:</span> {[...(ex.targetMuscles||[]), ...(ex.secondaryMuscles||[])].join(', ')}
                        </p>
                      )}
                      {ex.instructions?.length > 0 && (
                        <ol className="list-decimal list-inside space-y-1 text-xs md:text-sm text-white/90">
                          {ex.instructions.map((step, idx) => (
                            <li key={idx}>{step.replace(/^Step:\s*/i, '')}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {matchedExercises.length === 0 && (
                <p className="text-sm text-[#b9c0bf]">{t('chat.noExercises')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
