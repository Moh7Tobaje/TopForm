import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/database'
import { supabaseService } from '@/lib/supabase'

// GET /api/workout/analytics - Get workout analytics and insights
export async function GET(request: NextRequest) {
  console.log('=== WORKOUT ANALYTICS API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get workout sessions
    const { data: sessions, error: sessionsError } = await supabaseService
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_date', startDate)
      .order('session_date', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions for analytics:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Get workout tracking data
    const { data: tracking, error: trackingError } = await supabaseService
      .from('workout_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', startDate)
      .order('workout_date', { ascending: false })

    if (trackingError) {
      console.error('Error fetching tracking data for analytics:', trackingError)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Calculate analytics
    const analytics = calculateWorkoutAnalytics(sessions || [], tracking || [], days)

    return NextResponse.json({ 
      success: true, 
      analytics,
      period: `${days} days`,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Workout Analytics API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateWorkoutAnalytics(sessions: any[], tracking: any[], days: number) {
  const analytics = {
    overview: {
      totalWorkouts: sessions.length,
      completedWorkouts: sessions.filter(s => s.status === 'completed').length,
      totalExercises: tracking.length,
      workoutFrequency: 0,
      completionRate: 0
    },
    performance: {
      totalSets: tracking.reduce((sum, t) => sum + (t.completed_sets || 0), 0),
      totalReps: tracking.reduce((sum, t) => sum + (t.completed_reps || 0), 0),
      averageEffort: 0,
      averageFormQuality: 0,
      totalVolume: 0
    },
    consistency: {
      workoutDays: new Set(sessions.map(s => s.session_date)).size,
      consistencyScore: 0,
      streakDays: 0,
      mostFrequentDay: ''
    },
    progress: {
      strengthGains: 0,
      volumeProgress: 0,
      personalRecords: 0,
      improvementAreas: [] as string[]
    },
    recommendations: [] as string[]
  }

  // Calculate overview metrics
  analytics.overview.workoutFrequency = Math.round((sessions.length / days) * 7 * 10) / 10 // workouts per week
  analytics.overview.completionRate = sessions.length > 0 ? Math.round((analytics.overview.completedWorkouts / sessions.length) * 100) : 0

  // Calculate performance metrics
  const effortScores = tracking.filter(t => t.perceived_effort).map(t => t.perceived_effort)
  const formScores = tracking.filter(t => t.form_quality).map(t => t.form_quality)
  
  analytics.performance.averageEffort = effortScores.length > 0 ? Math.round((effortScores.reduce((a, b) => a + b, 0) / effortScores.length) * 10) / 10 : 0
  analytics.performance.averageFormQuality = formScores.length > 0 ? Math.round((formScores.reduce((a, b) => a + b, 0) / formScores.length) * 10) / 10 : 0

  // Calculate total volume (estimated)
  analytics.performance.totalVolume = tracking.reduce((sum, t) => {
    const weight = parseFloat(t.completed_weight?.replace(/[^\d.]/g, '') || '0')
    return sum + (weight * (t.completed_reps || 0) * (t.completed_sets || 0))
  }, 0)

  // Calculate consistency metrics
  analytics.consistency.consistencyScore = Math.min(100, Math.round((analytics.consistency.workoutDays / days) * 100))
  
  // Find most frequent workout day
  const dayCounts = sessions.reduce((counts, session) => {
    const day = new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long' })
    counts[day] = (counts[day] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  analytics.consistency.mostFrequentDay = Object.entries(dayCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || ''

  // Generate recommendations
  if (analytics.overview.completionRate < 80) {
    analytics.recommendations.push('Focus on completing more planned workouts for better consistency')
  }
  
  if (analytics.performance.averageEffort < 6) {
    analytics.recommendations.push('Consider increasing workout intensity for better results')
  }
  
  if (analytics.consistency.consistencyScore < 50) {
    analytics.recommendations.push('Try to establish a more regular workout schedule')
  }
  
  if (analytics.overview.completedWorkouts >= 4) {
    analytics.recommendations.push('Great consistency! Keep up the excellent work')
  }

  return analytics
}
