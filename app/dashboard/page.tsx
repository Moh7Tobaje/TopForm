"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Plus,
  Home,
  Clock,
  Dumbbell,
  User,
  Video,
  TrendingUp,
  Target,
  Shield,
  ChevronRight,
  Filter,
  Upload,
  Play,
  BarChart3,
  Activity,
  LucideIcon
} from "lucide-react"
import { useLanguage } from '@/contexts/LanguageContext'

// Import dashboard components
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ExerciseCard } from "@/components/dashboard/ExerciseCard"
import { AnalysisCard } from "@/components/dashboard/AnalysisCard"
import { FloatingActionButton } from "@/components/dashboard/FloatingActionButton"
import { BottomNavigation } from "@/components/dashboard/BottomNavigation"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { SkeletonStats, SkeletonExercises, SkeletonAnalyses } from "@/components/dashboard/SkeletonComponents"

// Import custom styles
import "@/styles/dashboard.css"

interface Analysis {
  id: string
  exercise: string
  date: string
  score: number
  summary: string
  icon: LucideIcon
  color: string
}

interface Exercise {
  id: string
  name: string
  icon: LucideIcon
  color: string
}

export default function Dashboard() {
  const { t, isRTL, language, setLanguage } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("Athlete")
  const [activeTab, setActiveTab] = useState("home")
  const [stats, setStats] = useState({
    videosAnalyzed: 0,
    averageScore: 0,
    issuesFixed: 0
  })

  const exercises: Exercise[] = [
    { id: "squat", name: "Squat", icon: Target, color: "#E53935" },
    { id: "deadlift", name: "Deadlift", icon: TrendingUp, color: "#4CAF50" },
    { id: "bench", name: "Bench Press", icon: Activity, color: "#2196F3" },
    { id: "ohp", name: "OHP", icon: Shield, color: "#FFC107" },
    { id: "rows", name: "Rows", icon: BarChart3, color: "#9C27B0" }
  ]

  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([
    {
      id: "1",
      exercise: "Squat",
      date: "Today",
      score: 78,
      summary: "Good depth, slight forward lean",
      icon: Target,
      color: "#E53935"
    },
    {
      id: "2",
      exercise: "Deadlift",
      date: "Yesterday",
      score: 85,
      summary: "Great form, maintain back position",
      icon: TrendingUp,
      color: "#4CAF50"
    },
    {
      id: "3",
      exercise: "Bench Press",
      date: "2 days ago",
      score: 92,
      summary: "Excellent control and depth",
      icon: Activity,
      color: "#2196F3"
    }
  ])

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        videosAnalyzed: 12,
        averageScore: 78,
        issuesFixed: 8
      })
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleAnalyzeVideo = () => {
    // Navigate to video analysis page
    console.log("Navigate to video analysis")
  }

  const handleExerciseClick = (exerciseId: string) => {
    // Navigate to exercise-specific analysis
    console.log(`Analyze ${exerciseId}`)
  }

  const handleAnalysisClick = (analysisId: string) => {
    // Navigate to analysis details
    console.log(`View analysis ${analysisId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        {/* Loading Header */}
        <header className="fixed top-0 w-full z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1A1A1A]">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 skeleton rounded-full"></div>
              <div className="w-20 h-6 skeleton rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 skeleton rounded-full"></div>
              <div className="w-8 h-8 skeleton rounded-full"></div>
              <div className="w-8 h-8 skeleton rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="pt-16 pb-20">
          <section className="bg-gradient-to-br from-[#B71C1C] to-[#0D0D0D] py-12 px-4">
            <div className="container mx-auto">
              <div className="h-20 skeleton rounded-xl mb-4"></div>
              <div className="h-12 skeleton rounded-lg w-64"></div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 space-y-8">
            <SkeletonStats />
            <SkeletonExercises />
            <SkeletonAnalyses />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E53935] to-[#B71C1C] rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FormAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-[#9E9E9E] hover:text-white">
              <Search className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative text-[#9E9E9E] hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53935] rounded-full pulse-dot"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#E53935] text-white font-bold">
                      {userName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                <DropdownMenuItem className="text-white hover:bg-[#2A2A2A]">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-[#2A2A2A]">
                  Settings
                </DropdownMenuItem>
                <SignedIn>
                  <SignOutButton>
                    <DropdownMenuItem className="text-white hover:bg-[#2A2A2A]">
                      Logout
                    </DropdownMenuItem>
                  </SignOutButton>
                </SignedIn>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        {/* Welcome Section */}
        <section className="welcome-gradient py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="fade-in-up">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {userName}
                </h1>
                <p className="text-[#9E9E9E] text-lg">
                  Ready to perfect your form today?
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleAnalyzeVideo}
                className="bg-[#E53935] hover:bg-[#B71C1C] text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ripple-button fade-in-up stagger-2"
              >
                <Upload className="w-5 h-5 mr-2" />
                Analyze New Video
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Stats Cards */}
          <div className="fade-in-up stagger-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                title="Videos Analyzed" 
                value={stats.videosAnalyzed} 
                icon={Video} 
                color="#E53935"
                delay={0}
              />
              <StatsCard 
                title="Average Score" 
                value={`${stats.averageScore}%`} 
                icon={BarChart3} 
                color="#4CAF50"
                delay={100}
              />
              <StatsCard 
                title="Issues Fixed" 
                value={stats.issuesFixed} 
                icon={Shield} 
                color="#2196F3"
                delay={200}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <section className="fade-in-up stagger-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Quick Analyze</h2>
              <Button variant="ghost" className="text-[#E53935] hover:text-[#B71C1C]">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  name={exercise.name}
                  icon={exercise.icon}
                  color={exercise.color}
                  onClick={() => handleExerciseClick(exercise.id)}
                />
              ))}
            </div>
          </section>

          {/* Recent Analyses */}
          <section className="fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Analyses</h2>
              <Button variant="ghost" className="text-[#9E9E9E] hover:text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis.id}
                    exercise={analysis.exercise}
                    date={analysis.date}
                    score={analysis.score}
                    summary={analysis.summary}
                    icon={analysis.icon}
                    color={analysis.color}
                    onClick={() => handleAnalysisClick(analysis.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                onButtonClick={handleAnalyzeVideo}
              />
            )}
          </section>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleAnalyzeVideo} />

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
