import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/database'
import { supabaseService } from '@/lib/supabase'

// GET /api/workout/progress - Get exercise progress and performance data
export async function GET(request: NextRequest) {
  console.log('=== WORKOUT PROGRESS GET API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const { searchParams } = new URL(request.url)
    const exerciseName = searchParams.get('exercise')
    const days = parseInt(searchParams.get('days') || '30') // Default to last 30 days

    let query = supabaseService
      .from('exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('performance_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('performance_date', { ascending: false })

    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching exercise progress:', error)
      return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 })
    }

    // Calculate progress insights
    const insights = calculateProgressInsights(data || [])

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      insights,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Workout Progress GET API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/workout/progress - Record exercise performance
export async function POST(request: NextRequest) {
  console.log('=== WORKOUT PROGRESS POST API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const body = await request.json()

    const {
      exercise_name,
      weight_used,
      reps_completed,
      sets_completed,
      progression_type = 'strength'
    } = body

    if (!exercise_name || !weight_used || !reps_completed) {
      return NextResponse.json({ error: 'exercise_name, weight_used, and reps_completed are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Extract numeric weight for calculations
    const numericWeight = extractNumericWeight(weight_used)
    const volumeTotal = numericWeight ? numericWeight * reps_completed * (sets_completed || 1) : 0
    
    // Calculate estimated 1RM
    const oneRepMaxEstimated = numericWeight ? calculateOneRepMax(numericWeight, reps_completed) : null
    
    // Check if this is a personal record
    const isPersonalRecord = await checkPersonalRecord(userId, exercise_name, oneRepMaxEstimated)

    const { data, error } = await supabaseService
      .from('exercise_performance')
      .insert({
        user_id: userId,
        exercise_name,
        weight_used,
        reps_completed,
        sets_completed: sets_completed || 1,
        one_rep_max_estimated: oneRepMaxEstimated,
        volume_total: volumeTotal,
        personal_record: isPersonalRecord,
        progression_type,
        performance_date: today,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error recording exercise performance:', error)
      return NextResponse.json({ error: 'Failed to record performance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      isPersonalRecord,
      message: isPersonalRecord ? 'New personal record!' : 'Performance recorded successfully'
    })

  } catch (error) {
    console.error('Workout Progress POST API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function extractNumericWeight(weightString: string): number | null {
  if (!weightString) return null
  
  const match = weightString.match(/[0-9]+(\.[0-9]+)?/)
  return match ? parseFloat(match[0]) : null
}

function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula: 1RM = weight × (1 + reps/30)
  if (reps <= 0) return weight
  return Math.round(weight * (1 + (reps / 30)) * 100) / 100
}

async function checkPersonalRecord(userId: string, exerciseName: string, current1RM: number | null): Promise<boolean> {
  if (!current1RM) return false
  
  const { data, error } = await supabaseService
    .from('exercise_performance')
    .select('one_rep_max_estimated')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .not('one_rep_max_estimated', 'is', null)
    .order('one_rep_max_estimated', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return true // First time doing this exercise
  }

  return current1RM > (data[0].one_rep_max_estimated || 0)
}

function calculateProgressInsights(data: any[]) {
  const insights = {
    totalWorkouts: data.length,
    personalRecords: data.filter(d => d.personal_record).length,
    strengthGains: 0,
    volumeProgress: 0,
    consistencyScore: 0,
    recommendations: [] as string[]
  }

  if (data.length === 0) return insights

  // Group by exercise
  const exerciseGroups = data.reduce((groups, item) => {
    const exercise = item.exercise_name
    if (!groups[exercise]) groups[exercise] = []
    groups[exercise].push(item)
    return groups
  }, {} as Record<string, any[]>)

  // Calculate strength gains
  Object.values(exerciseGroups).forEach((exercises) => {
    const exerciseArray = exercises as any[]
    if (exerciseArray.length >= 2) {
      const latest = exerciseArray[0]
      const previous = exerciseArray[1]
      
      if (latest.one_rep_max_estimated && previous.one_rep_max_estimated) {
        const gain = ((latest.one_rep_max_estimated - previous.one_rep_max_estimated) / previous.one_rep_max_estimated) * 100
        if (gain > 0) insights.strengthGains++
      }
    }
  })

  // Calculate volume progress
  const recentVolume = data.slice(0, 7).reduce((sum, item) => sum + (item.volume_total || 0), 0)
  const previousVolume = data.slice(7, 14).reduce((sum, item) => sum + (item.volume_total || 0), 0)
  
  if (previousVolume > 0) {
    insights.volumeProgress = ((recentVolume - previousVolume) / previousVolume) * 100
  }

  // Calculate consistency score (workouts per week)
  const uniqueDays = new Set(data.map(d => d.performance_date)).size
  insights.consistencyScore = Math.min(100, (uniqueDays / 7) * 100)

  // Generate recommendations
  if (insights.strengthGains === 0 && data.length > 3) {
    insights.recommendations.push('Consider increasing weight or reps to stimulate strength gains')
  }
  
  if (insights.consistencyScore < 50) {
    insights.recommendations.push('Try to maintain a more consistent workout schedule')
  }
  
  if (insights.personalRecords > 0) {
    insights.recommendations.push('Great progress! Keep pushing your limits safely')
  }

  return insights
}
