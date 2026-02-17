'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface ProgressData {
  currentStreak: number
  longestStreak: number
  todayWorkouts: number
  todayExercises: number
  todaySets: number
  todayCalories: number
  todayProtein: number
  todayScore: number
  totalConsumedCalories: number
  totalConsumedProtein: number
  totalTargetCalories: number
  totalTargetProtein: number
  calorieCompliance: number
  proteinCompliance: number
  recentPRsCount: number
  unreadInsightsCount: number
  achievedMilestonesCount: number
  activeToday: boolean
}

interface PersonalRecord {
  id: number
  exerciseName: string
  type: 'weight' | 'reps' | 'volume' | 'time'
  value: number
  date: string
  details: any
}

interface AIInsight {
  id: number
  type: string
  category: string
  title: string
  message: string
  actionableAdvice: string
  priorityLevel: number
  generatedAt: string
  isRead: boolean
  isBookmarked: boolean
}

interface ProgressMetadata {
  timeRange: string
  workoutFrequency: number
  nutritionTrackingDays: number
  avgWorkoutEffort: number
  dataFreshness: string
  errors: {
    progress: boolean
    records: boolean
    insights: boolean
    workouts: boolean
    nutrition: boolean
    weekly: boolean
  }
}

interface UseMainPageProgressReturn {
  progressData: ProgressData | null
  personalRecords: PersonalRecord[]
  aiInsights: AIInsight[]
  realTimeInsights: AIInsight[]
  metadata: ProgressMetadata | null
  loading: boolean
  error: string | null
}

// Simplified hook for main page that fetches data once without auto-refresh
export function useMainPageProgress(): UseMainPageProgressReturn {
  const user = useUser()?.user

  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [realTimeInsights, setRealTimeInsights] = useState<AIInsight[]>([])
  const [metadata, setMetadata] = useState<ProgressMetadata | null>(null)
  const [loading, setLoading] = useState(user ? true : false)
  const [error, setError] = useState<string | null>(user ? null : 'Authentication temporarily disabled')

  // Single data fetch without auto-refresh
  useEffect(() => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/progress/enhanced-dashboard?timeRange=7d&realTime=false`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Update state with new data
        setProgressData(data.progressData)
        setPersonalRecords(data.personalRecords || [])
        setAiInsights(data.aiInsights || [])
        setMetadata(data.metadata || {})

      } catch (err) {
        console.error('Error fetching progress data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data')

        // Don't show toast for network errors in production
        if (err instanceof Error && err.message.includes('fetch') && process.env.NODE_ENV === 'development') {
          try {
            toast.error('Network error. Please check your connection.')
          } catch (toastErr) {
            console.warn('Toast not available:', toastErr)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  return {
    progressData,
    personalRecords,
    aiInsights,
    realTimeInsights,
    metadata,
    loading,
    error
  }
}
