'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

interface UseProgressDataReturn {
  progressData: ProgressData | null
  personalRecords: PersonalRecord[]
  aiInsights: AIInsight[]
  realTimeInsights: AIInsight[]
  metadata: ProgressMetadata | null
  loading: boolean
  error: string | null
  timeRange: '7d' | '30d' | '90d'
  setTimeRange: (range: '7d' | '30d' | '90d') => void
  refreshData: () => Promise<void>
  syncWorkoutData: (workoutData: any) => Promise<void>
  syncNutritionData: (nutritionData: any) => Promise<void>
  markInsightAsRead: (insightId: number) => Promise<void>
  bookmarkInsight: (insightId: number, bookmarked: boolean) => Promise<void>
  forceRealTimeUpdate: () => Promise<void>
}

export function useProgressData(): UseProgressDataReturn {
  let user = null
  try {
    const userData = useUser()
    user = userData?.user
  } catch (err) {
    console.warn('Clerk user hook not available:', err)
  }

  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [realTimeInsights, setRealTimeInsights] = useState<AIInsight[]>([])
  const [metadata, setMetadata] = useState<ProgressMetadata | null>(null)
  const [loading, setLoading] = useState(user ? true : false)
  const [error, setError] = useState<string | null>(user ? null : 'Authentication temporarily disabled')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  const lastSyncTime = useRef<string>(new Date().toISOString())
  const syncInProgress = useRef<boolean>(false)

  // Enhanced data fetching with intelligent caching
  const fetchProgressData = useCallback(async (includeRealTime = false) => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/progress/enhanced-dashboard?timeRange=${timeRange}&realTime=${includeRealTime}`,
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

      if (includeRealTime && data.realTimeInsights) {
        setRealTimeInsights(data.realTimeInsights)
      }

      lastSyncTime.current = new Date().toISOString()

    } catch (err) {
      console.error('Error fetching progress data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch progress data')

      // Don't show toast for network errors in production to avoid spam
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
  }, [user, timeRange])

  // Real-time data synchronization
  const syncData = useCallback(async (syncType: string, data: any) => {
    if (!user || syncInProgress.current) return

    syncInProgress.current = true

    try {
      const response = await fetch('/api/progress/real-time-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncType,
          data,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.syncResult.updated > 0) {
        // Trigger immediate data refresh with real-time insights
        await fetchProgressData(true)
        
        // Show success toast
        toast.success(`Synced ${result.syncResult.updated} items successfully`)
        
        // Log any sync errors
        if (result.syncResult.errors.length > 0) {
          console.warn('Sync warnings:', result.syncResult.errors)
        }
      }

    } catch (err) {
      console.error('Sync error:', err)
      toast.error('Failed to sync data. Please try again.')
    } finally {
      syncInProgress.current = false
    }
  }, [user, fetchProgressData])

  // Specific sync functions
  const syncWorkoutData = useCallback(async (workoutData: any) => {
    await syncData('workout', workoutData)
  }, [syncData])

  const syncNutritionData = useCallback(async (nutritionData: any) => {
    await syncData('nutrition', nutritionData)
  }, [syncData])

  // Insight interaction functions
  const markInsightAsRead = useCallback(async (insightId: number) => {
    try {
      const response = await fetch('/api/progress/ai-insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, isRead: true })
      })

      if (response.ok) {
        // Update local state
        setAiInsights(prev => 
          prev.map(insight => 
            insight.id === insightId 
              ? { ...insight, isRead: true }
              : insight
          )
        )
      }
    } catch (err) {
      console.error('Failed to mark insight as read:', err)
    }
  }, [])

  const bookmarkInsight = useCallback(async (insightId: number, bookmarked: boolean) => {
    try {
      const response = await fetch('/api/progress/ai-insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, isBookmarked: bookmarked })
      })

      if (response.ok) {
        // Update local state
        setAiInsights(prev => 
          prev.map(insight => 
            insight.id === insightId 
              ? { ...insight, isBookmarked: bookmarked }
              : insight
          )
        )
        
        toast.success(bookmarked ? 'Insight bookmarked' : 'Bookmark removed')
      }
    } catch (err) {
      console.error('Failed to update bookmark:', err)
      toast.error('Failed to update bookmark')
    }
  }, [])

  // Force real-time update
  const forceRealTimeUpdate = useCallback(async () => {
    await fetchProgressData(true)
    toast.success('Data refreshed with latest insights')
  }, [fetchProgressData])

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchProgressData()
  }, [fetchProgressData])

  // Auto-refresh and real-time updates
  useEffect(() => {
    if (!user) return

    // Initial data fetch
    fetchProgressData()

    // Set up intelligent refresh intervals
    const intervals = [
      // Every 2 minutes for real-time updates when user is active
      setInterval(() => {
        if (document.visibilityState === 'visible' && !loading) {
          fetchProgressData(true)
        }
      }, 120000), // 2 minutes

      // Every 10 minutes for background updates
      setInterval(() => {
        if (!loading) {
          fetchProgressData(false)
        }
      }, 600000) // 10 minutes
    ]

    // Listen for visibility changes to optimize updates
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProgressData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      intervals.forEach(clearInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, fetchProgressData, loading])

  // Handle time range changes
  useEffect(() => {
    if (user) {
      setProgressData(null) // Clear data to show loading state
      fetchProgressData()
    }
  }, [timeRange, user, fetchProgressData])

  return {
    progressData,
    personalRecords,
    aiInsights,
    realTimeInsights,
    metadata,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshData,
    syncWorkoutData,
    syncNutritionData,
    markInsightAsRead,
    bookmarkInsight,
    forceRealTimeUpdate
  }
}
