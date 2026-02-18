"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs"
import { Globe, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  Play,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Dumbbell,
  Apple,
  BarChart3,
  Star,
  Bot,
  Trophy,
  Award,
  Flame,
  Activity,
  Pin,
  Video
} from "lucide-react"

import { useLanguage } from '@/contexts/LanguageContext'

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "action"
}

interface CommunityPost {
  id: string
  user: {
    name: string
    avatar: string
    level: number
    badge?: string
  }
  content: string
  image?: string
  timestamp: Date
  likes: number
  comments: number
  isLiked: boolean
  type: "achievement" | "workout" | "motivation" | "question"
}

interface ForumTopic {
  id: string
  title: string
  author: string
  avatar: string
  replies: number
  views: number
  lastActivity: Date
  category: string
  isPinned?: boolean
}

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  points: number
  rank: number
  streak: number
  workouts: number
  badge?: string
}

export default function TopCoachApp() {
  const { t, isRTL, language, setLanguage } = useLanguage()

  const [activeTab, setActiveTab] = useState("home")
  const [isVisible, setIsVisible] = useState(false)
  const [comingSoonVisible, setComingSoonVisible] = useState(false)
  const [randomQuote, setRandomQuote] = useState<string>("")
  
  // Array of motivational quotes that will rotate
  const motivationalQuotes = [
    "AI won't lift the weights for you, but it will make sure every rep counts. 🏋️‍♂️⚡",
    "Your discipline builds the body, AI sharpens the strategy. 🔥🧠",
    "Muscles grow from effort, AI makes sure it's the right effort. 💪🤖",
    "No excuses—AI gives you the plan, you bring the fire. 📋🔥",
    "Strength is forged in sweat, precision is powered by AI. 💦⚙️",
    "With AI, your training isn't random—it's lethal. 🎯⚡",
    "AI doesn't replace your grind, it multiplies it. 🚀💥",
    "Stop guessing, start dominating—AI is your secret weapon. 🧩👊",
    "AI unlocks the science, you unleash the beast. 🔓🐉",
    "Every champion trains hard, the smart ones train with AI. 🏆🤖",
    "AI kills the limits you set in your head—now you have no ceiling. 🧨🚀",
    "Your will builds power, AI builds the path. 🛤️💪",
    "AI is the edge. You are the force. Together, unstoppable. ⚡🦾",
    "The future of bodybuilding isn't bigger biceps—it's smarter training. 💡💪",
    "AI gives clarity, you give chaos to the weights. 🌪️🏋️",
    "Train like a warrior, recover like a scientist—AI makes it possible. ⚔️🔬",
    "AI strips away the lies; what's left is pure growth. 🧹📈",
    "No more wasted sets, no more wasted days—AI is precision strength. ⏳⚡",
    "Bodybuilding with AI isn't cheating—it's evolution. 🔥🧬"
  ]
  
  // Set random quote once on mount
  useEffect(() => {
    if (randomQuote === "") {
      setRandomQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
    }
  }, [randomQuote, motivationalQuotes])
  
  const triggerComingSoon = () => {
    setComingSoonVisible(true)
  }
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      user: { name: "Sarah Chen", avatar: "/fit-woman-outdoors.png", level: 15, badge: "Consistency King" },
      content:
        "Just completed my 30-day workout streak! The AI coach really helped me stay motivated. Who else is on a streak?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8,
      isLiked: false,
      type: "achievement",
    },
    {
      id: "2",
      user: { name: "Mike Rodriguez", avatar: "/professional-man.png", level: 12 },
      content:
        "Quick question - what's everyone's favorite post-workout meal? Looking for some new ideas to fuel my recovery!",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 15,
      comments: 12,
      isLiked: true,
      type: "question",
    },
    {
      id: "3",
      user: { name: "Emma Thompson", avatar: "/woman-runner.png", level: 18, badge: "Marathon Ready" },
      content: "Morning workout done! 5K run in 22 minutes - new personal best! The weather was perfect today.",
      image: "/morning-run-scenery.png",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 31,
      comments: 6,
      isLiked: false,
      type: "workout",
    },
    {
      id: "4",
      user: { name: "Alex Kim", avatar: "/fitness-enthusiast.png", level: 8 },
      content: "Keep pushing your limits every day!",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 42,
      comments: 15,
      isLiked: true,
      type: "motivation",
    },
  ])

  const [forumTopics] = useState<ForumTopic[]>([
    {
      id: "1",
      title: "Best exercises for building core strength?",
      author: "FitnessNewbie",
      avatar: "/beginner-avatar.png",
      replies: 23,
      views: 156,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      category: "Strength Training",
      isPinned: false,
    },
    {
      id: "2",
      title: "Weekly Challenge: 10,000 Steps Daily",
      author: "TopCoachTeam",
      avatar: "/images/top-coach-logo.svg",
      replies: 87,
      views: 432,
      lastActivity: new Date(Date.now() - 30 * 1000),
      category: "Challenges",
      isPinned: true,
    },
    {
      id: "3",
      title: "Meal prep ideas for busy professionals",
      author: "HealthyEater",
      avatar: "/nutrition-expert.png",
      replies: 34,
      views: 289,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: "Nutrition"
    },
    {
      id: "4",
      title: "How to stay motivated during winter months?",
      author: "WinterWarrior",
      avatar: "/winter-athlete.png",
      replies: 45,
      views: 201,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
      category: "Motivation",
    },
  ])

  const [leaderboard] = useState<LeaderboardUser[]>([
    {
      id: "1",
      name: "Emma Thompson",
      avatar: "/woman-runner.png",
      points: 2840,
      rank: 1,
      streak: 28,
      workouts: 45,
      badge: "Marathon Ready",
    },
    {
      id: "2",
      name: "Sarah Chen",
      avatar: "/fit-woman-outdoors.png",
      points: 2650,
      rank: 2,
      streak: 30,
      workouts: 42,
      badge: "Consistency King",
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      avatar: "/professional-man.png",
      points: 2420,
      rank: 3,
      streak: 15,
      workouts: 38,
    },
    {
      id: "4",
      name: "Alex Kim",
      avatar: "/fitness-enthusiast.png",
      points: 2180,
      rank: 4,
      streak: 12,
      workouts: 35,
    },
    {
      id: "5",
      name: "You",
      avatar: "/user-avatar.png",
      points: 1950,
      rank: 5,
      streak: 0,
      workouts: 32,
    },
  ])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: t('ai.welcome'),
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])




  const toggleLike = (postId: string) => {
    setCommunityPosts((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const weeklyWorkoutData = [
    { day: "Mon", workouts: 2, calories: 450, duration: 45 },
    { day: "Tue", workouts: 1, calories: 320, duration: 30 },
    { day: "Wed", workouts: 3, calories: 680, duration: 65 },
    { day: "Thu", workouts: 2, calories: 520, duration: 50 },
    { name: "Strength", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Cardio", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Flexibility", value: 15, color: "hsl(var(--chart-3))" },
    { name: "Sports", value: 10, color: "hsl(var(--chart-4))" },
  ]

  const achievements = [
    {
      id: 1,
      title: "First Week Complete",
      description: "Completed your first week of training",
      icon: Trophy,
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Consistency King",
      description: "7 days workout streak",
      icon: Flame,
      earned: true,
      date: "2024-01-22",
    },
    {
      id: 3,
      title: "Calorie Crusher",
      description: "Burned 5000+ calories this month",
      icon: Target,
      earned: true,
      date: "2024-02-01",
    },
    {
      id: 4,
      title: "Strength Builder",
      description: "Increased max weight by 20%",
      icon: Dumbbell,
      earned: false,
    },
    {
      id: 5,
      title: "Marathon Ready",
      description: "Complete 100 cardio sessions",
      icon: Activity,
      earned: false,
    },
    {
      id: 6,
      title: "Perfect Month",
      description: "30 days without missing a workout",
      icon: Award,
      earned: false,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        t('ai.generateResponse'),
        t('ai.strengthResponse'),
        t('ai.motivationResponse'),
      ]

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {

    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      content: action,
      sender: "user",
      timestamp: new Date(),
      type: "action",
    }

    setChatMessages((prev) => [...prev, actionMessage])
    setIsTyping(true)

    setTimeout(() => {
      let response = ""
      switch (action) {
        case "Meal Suggestions":
          response = t('ai.mealResponse')
          break
        default:
          response = t('ai.defaultResponse')
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1200)
  }

  const testimonials = [
    {
      name: t('testimonials.sarah.name'),
      role: t('testimonials.sarah.role'),
      content: t('testimonials.sarah.content'),
      rating: 5,
      avatar: "/fit-woman-outdoors.png",
    },
    {
      name: t('testimonials.mike.name'),
      role: t('testimonials.mike.role'),
      content: t('testimonials.mike.content'),
      rating: 5,
      avatar: "/professional-man.png",
    },
    {
      name: t('testimonials.emma.name'),
      role: t('testimonials.emma.role'),
      content: t('testimonials.emma.content'),
      rating: 5,
      avatar: "/woman-runner.png",
    },
  ]

  const workoutPlan = [
    { exercise: "Push-ups", sets: 3, reps: 12, rest: 60, completed: true },
    { exercise: "Squats", sets: 4, reps: 15, rest: 90, completed: true },
    { exercise: "Plank", sets: 3, reps: "45s", rest: 60, completed: false },
    { exercise: "Burpees", sets: 3, reps: 8, rest: 120, completed: false },
  ]

  const mealPlan = [
    {
      meal: "Breakfast",
      name: "Protein Power Bowl",
      calories: 420,
      protein: 32,
      carbs: 28,
      fats: 18,
      image: "/healthy-breakfast-bowl.png",
    },
    {
      meal: "Lunch",
      name: "Grilled Chicken Salad",
      calories: 380,
      protein: 35,
      carbs: 15,
      fats: 22,
      image: "/grilled-chicken-salad.png",
    },
    {
      meal: "Dinner",
      name: "Salmon & Quinoa",
      calories: 520,
      protein: 38,
      carbs: 45,
      fats: 24,
      image: "/salmon-quinoa-dinner.png",
    },
  ]

  if (activeTab === "home") {
    return (
      <div className="min-h-screen circuit-pattern-dense bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative logo-container">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="Top Coach"
                  width={40}
                  height={40}
                  className="rounded-xl border-2 border-[#cc2e2f]/30 logo-header shadow-lg md:w-12 md:h-12"
                  priority
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-[#cc2e2f] rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <span className="text-lg md:text-xl font-bold font-[var(--font-heading)] bg-gradient-to-r from-[#cc2e2f] to-white bg-clip-text text-transparent">Top Coach</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <Button variant="ghost" asChild>
              </Button>
              <Button variant="ghost" asChild>
              </Button>
              <Button variant="ghost" onClick={triggerComingSoon}>
                {t('nav.community')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Globe className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-20">
                  <DropdownMenuItem className="justify-center" onClick={() => setLanguage('en')}>
                    EN
                  </DropdownMenuItem>
                  <DropdownMenuItem className="justify-center" onClick={() => setLanguage('ar')}>
                    AR
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SignedOut>
                <Button asChild size="sm" className="gradient-red-silver glow-red">
                  <Link href="/sign-in">{t('nav.startFree')}</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <Button size="sm" className="gradient-red-silver glow-red">{t('nav.logOut')}</Button>
                </SignOutButton>
              </SignedIn>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {activeTab === "home" && (
          <section className="pt-20 pb-12 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src="https://my.spline.design/backlightbgeffect-OMYqWUmL3RYsKEfbabxMzhjU/"
              frameBorder="0"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-[1px]"></div>
          
          {/* Animated floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full particle-float"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-primary/20 rounded-full particle-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-white/10 rounded-full particle-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-primary/15 rounded-full particle-float" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-white/20 rounded-full particle-float" style={{animationDelay: '1.5s'}}></div>
          </div>

          <div className="container mx-auto text-center relative z-10">
            <div
              className={`transition-all duration-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Badge className="mb-6 md:mb-8 gradient-red-silver text-white border-0 text-sm font-medium px-4 py-2 glow-red animate-pulse">
                <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {t('hero.badge')}
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-[var(--font-heading)] mb-6 md:mb-8 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl leading-tight tracking-tight">
                <span className="block animate-pulse">{t('hero.title')}</span>
                <span className="block text-primary drop-shadow-lg mt-2 md:mt-4">{t('hero.subtitle')}</span>
              </h1>
              <SignedOut>
                {activeTab === "home" && (
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-4 font-light">
                    {t('hero.description')}
                  </p>
                )}
              </SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
                <SignedOut>
                  {activeTab === "home" && (
                    <Button asChild size="lg" className={`gradient-red-silver glow-red px-8 md:px-12 py-6 md:py-8 w-full sm:w-auto text-lg md:text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-500/25 ${isRTL ? 'text-lg md:text-xl' : 'text-lg md:text-xl'}`}>
                      <Link href="/sign-in">
                        <Play className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                        {t('hero.cta')}
                      </Link>
                    </Button>
                  )}
                </SignedOut>
              </div>
            </div>

            {/* Demo Preview */}
            {activeTab === "home" && (
              <div
                className={`transition-all duration-800 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <Card className="max-w-5xl mx-auto gradient-black-gray border-border glow-silver backdrop-blur-md bg-black/70 transition-all duration-300 shadow-2xl">
                  <CardContent className="p-6 md:p-10">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
                          <Avatar className="border-3 border-primary w-14 h-14 md:w-16 md:h-16 shadow-lg">
                            <AvatarImage src="/images/top-coach-logo.svg" className="rounded-full" />
                            <AvatarFallback className="bg-gradient-to-br from-[#cc2e2f] to-[#cc2e2f] text-white font-bold text-xl">TC</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-bold text-lg md:text-xl text-white">{t('hero.aiCoach')}</p>
                            <p className="text-sm md:text-base text-primary font-medium flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                              {t('hero.onlineNow')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-card to-card/50 p-6 md:p-8 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
                          <p className="text-lg md:text-xl font-medium leading-relaxed text-white">
                            "{randomQuote}"
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button size="lg" variant="outline" onClick={() => handleQuickAction("Meal Suggestions")} className="text-sm md:text-base px-6 py-3 border-primary/30 transition-all duration-200">
                            {t('actions.mealSuggestions')}
                          </Button>
                          <Button size="lg" variant="outline" asChild className="text-sm md:text-base px-6 py-3 border-primary/30 transition-all duration-200">
                            <Link href="/analyze-performance">
                              Analyze Performance
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-card to-card/50 p-6 md:p-8 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-lg md:text-xl text-white">Today's Summary</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <div className="bg-gradient-to-br from-primary/10 to-card/50 p-4 md:p-6 rounded-2xl border border-primary/20 text-center transition-all duration-300">
                            <Target className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3" />
                            <p className="text-sm md:text-base font-bold text-white mb-1">{t('hero.calories')}</p>
                            <p className="text-lg md:text-2xl font-black text-white mb-2">Coming Soon</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{t('hero.requiredConsumed')}</p>
                          </div>
                          <div className="bg-gradient-to-br from-secondary to-card/50 p-4 md:p-6 rounded-2xl border border-border/50 text-center transition-all duration-300">
                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3" />
                            <p className="text-sm md:text-base font-bold text-white mb-1">{t('hero.streak')}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Testimonials */}
        <SignedOut>
          {activeTab === "home" && (
            <section className="py-16 md:py-24 px-4 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
              <div className="container mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-[var(--font-heading)] mb-6 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent" dangerouslySetInnerHTML={{ __html: t('testimonials.title') }} />
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {testimonials.map((testimonial, index) => (
                    <Card
                      key={index}
                      className="gradient-black-gray border-border transition-all duration-300 group cursor-pointer"
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="flex items-center space-x-1 mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary transform group-hover:scale-110 transition-transform duration-300" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-6 text-base md:text-lg leading-relaxed font-light italic">"{testimonial.content}"</p>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-primary/20 group-hover:border-primary transition-colors duration-300">
                              <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">{testimonial.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div>
                            <p className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors duration-300">{testimonial.name}</p>
                            <p className="text-sm md:text-base text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </SignedOut>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border md:hidden z-40">
          <div className="flex justify-around py-3 px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="flex-col space-y-2 min-h-[70px] group transition-all duration-200">
              <div className="relative">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="Home"
                  width={24}
                  height={24}
                  className="rounded-full border border-[#cc2e2f]/30 logo-message transition-all duration-200"
                />
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#cc2e2f] rounded-full border border-card animate-pulse"></div>
              </div>
              <span className="text-xs font-semibold group-hover:text-[#cc2e2f] transition-colors duration-200">{t('nav.home')}</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="flex-col space-y-2 min-h-[70px] group transition-all duration-200">
              <Link href="/analyze-performance">
                <Video className="w-5 h-5 transition-all duration-200" />
                <span className="text-xs font-semibold transition-colors duration-200">Analyze Performance</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="flex-col space-y-2 min-h-[70px] group transition-all duration-200">
            </Button>
            <Button variant="ghost" size="sm" onClick={triggerComingSoon} className="flex-col space-y-2 min-h-[70px] group transition-all duration-200">
              <Users className="w-5 h-5 transition-all duration-200" />
              <span className="text-xs font-semibold transition-colors duration-200">{t('nav.community')}</span>
            </Button>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        {comingSoonVisible && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setComingSoonVisible(false)}
          >
            <div className="text-center px-8 py-12 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur-md max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">{t('comingSoon.title')}</h3>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">{t('comingSoon.subtitle')}</p>
              <div className="mt-8">
                <Button 
                  onClick={() => setComingSoonVisible(false)}
                  className="gradient-red-silver glow-red px-8 py-3 font-semibold"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        )}


      </div>
    )
  }

  // Community Tab
  if (activeTab === "community") {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">Community Forum</h1>
              <p className="text-muted-foreground">Connect with Other Fitness Enthusiasts</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline">
              Back to Home
            </Button>
          </div>

          <div className="grid gap-6">
            {forumTopics.map((topic) => (
              <Card
                key={topic.id}
                className="gradient-black-gray border-border transition-all duration-300 hover:glow-silver"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={topic.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{topic.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.author} • {topic.replies} replies • {topic.views} views
                        </p>
                      </div>
                    </div>
                    {topic.isPinned && (
                      <Badge className="gradient-red-silver text-white border-0">
                        <Pin className="w-4 h-4 mr-2" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{topic.lastActivity.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }



  return null
}
