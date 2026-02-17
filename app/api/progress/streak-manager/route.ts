import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// API endpoint to manage streaks correctly based on daily activity
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const body = await request.json()
    const { action, activityType, activityData } = body

    // Get user ID from Clerk user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userIdDb = userData.user_id
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Get current streak data
    const { data: currentStreak, error: streakError } = await supabase
      .from('progress_streaks')
      .select('current_streak, longest_streak, last_activity_date, workout_streak, nutrition_streak')
      .eq('user_id', userIdDb)
      .single()

    if (streakError && streakError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    let streakData = currentStreak || {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      workout_streak: 0,
      nutrition_streak: 0
    }

    // Check if we need to reset streak (new day without activity)
    if (streakData.last_activity_date && streakData.last_activity_date !== todayStr) {
      const lastActivityDate = new Date(streakData.last_activity_date)
      const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // If more than 1 day has passed, reset streak
      if (daysDiff > 1) {
        streakData.current_streak = 0
        streakData.workout_streak = 0
        streakData.nutrition_streak = 0
      }
    }

    // Handle different actions
    switch (action) {
      case 'check_activity':
        return await checkDailyActivity(supabase, userIdDb, todayStr, streakData)
      
      case 'reset_streak':
        return await resetStreak(supabase, userIdDb, streakData)
      
      case 'update_activity':
        return await updateActivity(supabase, userIdDb, todayStr, activityType, activityData, streakData)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Streak manager API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function checkDailyActivity(supabase: any, userIdDb: string, todayStr: string, streakData: any) {
  // Check for today's activity
  const [
    { data: workouts },
    { data: nutrition }
  ] = await Promise.all([
    supabase
      .from('workout_tracking')
      .select('workout_date')
      .eq('user_id', userIdDb)
      .eq('workout_date', todayStr),
    
    supabase
      .from('nutrition_tracking')
      .select('timestamp')
      .eq('user_id', userIdDb)
      .gte('timestamp', new Date(todayStr).toISOString())
      .lt('timestamp', new Date(todayStr + 'T23:59:59.999Z').toISOString())
  ])

  const hasWorkoutActivity = workouts && workouts.length > 0
  const hasNutritionActivity = nutrition && nutrition.length > 0
  const hasAnyActivity = hasWorkoutActivity || hasNutritionActivity

  // Update streak based on activity
  let newStreak = streakData.current_streak
  let newWorkoutStreak = streakData.workout_streak || 0
  let newNutritionStreak = streakData.nutrition_streak || 0

  if (hasAnyActivity) {
    if (streakData.last_activity_date !== todayStr) {
      // Check if yesterday had activity (continuing streak)
      const yesterday = new Date(todayStr)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const [
        { data: yesterdayWorkouts },
        { data: yesterdayNutrition }
      ] = await Promise.all([
        supabase
          .from('workout_tracking')
          .select('workout_date')
          .eq('user_id', userIdDb)
          .eq('workout_date', yesterdayStr),
        
        supabase
          .from('nutrition_tracking')
          .select('timestamp')
          .eq('user_id', userIdDb)
          .gte('timestamp', new Date(yesterdayStr).toISOString())
          .lt('timestamp', new Date(yesterdayStr + 'T23:59:59.999Z').toISOString())
      ])

      const hadYesterdayActivity = (yesterdayWorkouts && yesterdayWorkouts.length > 0) || 
                                   (yesterdayNutrition && yesterdayNutrition.length > 0)

      if (hadYesterdayActivity || streakData.current_streak === 0) {
        newStreak += 1
      } else {
        // Check if streak should be reset (gap in days)
        if (streakData.last_activity_date) {
          const lastActivity = new Date(streakData.last_activity_date)
          const daysDiff = Math.floor((new Date(todayStr).getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff > 1) {
            newStreak = 1 // Start new streak
          } else {
            newStreak += 1 // Continue streak
          }
        } else {
          newStreak = 1 // First activity
        }
      }

      // Update specific streaks
      if (hasWorkoutActivity) {
        newWorkoutStreak += 1
      }
      if (hasNutritionActivity) {
        newNutritionStreak += 1
      }
    }
  } else {
    // No activity today - check if we need to reset
    if (streakData.last_activity_date && streakData.last_activity_date !== todayStr) {
      const lastActivity = new Date(streakData.last_activity_date)
      const daysDiff = Math.floor((new Date(todayStr).getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff >= 1) {
        newStreak = 0
        newWorkoutStreak = 0
        newNutritionStreak = 0
      }
    }
  }

  // Update database
  const updateData = {
    current_streak: newStreak,
    longest_streak: Math.max(streakData.longest_streak || 0, newStreak),
    last_activity_date: hasAnyActivity ? todayStr : streakData.last_activity_date,
    workout_streak: newWorkoutStreak,
    nutrition_streak: newNutritionStreak,
    updated_at: new Date().toISOString()
  }

  await supabase
    .from('progress_streaks')
    .upsert({
      user_id: userIdDb,
      ...updateData
    })

  return NextResponse.json({
    success: true,
    streakData: {
      currentStreak: newStreak,
      longestStreak: updateData.longest_streak,
      lastActivityDate: updateData.last_activity_date,
      workoutStreak: newWorkoutStreak,
      nutritionStreak: newNutritionStreak,
      hasActivityToday: hasAnyActivity,
      hasWorkoutActivity,
      hasNutritionActivity
    }
  })
}

async function resetStreak(supabase: any, userIdDb: string, streakData: any) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  await supabase
    .from('progress_streaks')
    .upsert({
      user_id: userIdDb,
      current_streak: 0,
      longest_streak: streakData.longest_streak || 0,
      last_activity_date: streakData.last_activity_date,
      workout_streak: 0,
      nutrition_streak: 0,
      updated_at: new Date().toISOString()
    })

  return NextResponse.json({
    success: true,
    streakData: {
      currentStreak: 0,
      longestStreak: streakData.longest_streak || 0,
      lastActivityDate: streakData.last_activity_date,
      workoutStreak: 0,
      nutritionStreak: 0
    }
  })
}

async function updateActivity(supabase: any, userIdDb: string, todayStr: string, activityType: string, activityData: any, streakData: any) {
  // This function is called when new activity is recorded
  // It updates the streak immediately
  
  let newStreak = streakData.current_streak || 0
  let newWorkoutStreak = streakData.workout_streak || 0
  let newNutritionStreak = streakData.nutrition_streak || 0

  if (streakData.last_activity_date !== todayStr) {
    // Check if yesterday had activity
    const yesterday = new Date(todayStr)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const [
      { data: yesterdayWorkouts },
      { data: yesterdayNutrition }
    ] = await Promise.all([
      supabase
        .from('workout_tracking')
        .select('workout_date')
        .eq('user_id', userIdDb)
        .eq('workout_date', yesterdayStr),
      
      supabase
        .from('nutrition_tracking')
        .select('timestamp')
        .eq('user_id', userIdDb)
        .gte('timestamp', new Date(yesterdayStr).toISOString())
        .lt('timestamp', new Date(yesterdayStr + 'T23:59:59.999Z').toISOString())
    ])

    const hadYesterdayActivity = (yesterdayWorkouts && yesterdayWorkouts.length > 0) || 
                                 (yesterdayNutrition && yesterdayNutrition.length > 0)

    if (hadYesterdayActivity || newStreak === 0) {
      newStreak += 1
    } else {
      // Check for gap
      if (streakData.last_activity_date) {
        const lastActivity = new Date(streakData.last_activity_date)
        const daysDiff = Math.floor((new Date(todayStr).getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1) {
          newStreak = 1 // Start new streak
        } else {
          newStreak += 1 // Continue streak
        }
      } else {
        newStreak = 1 // First activity
      }
    }
  }

  // Update specific streaks based on activity type
  if (activityType === 'workout') {
    newWorkoutStreak += 1
  } else if (activityType === 'nutrition') {
    newNutritionStreak += 1
  }

  // Update database
  const updateData = {
    current_streak: newStreak,
    longest_streak: Math.max(streakData.longest_streak || 0, newStreak),
    last_activity_date: todayStr,
    workout_streak: newWorkoutStreak,
    nutrition_streak: newNutritionStreak,
    updated_at: new Date().toISOString()
  }

  await supabase
    .from('progress_streaks')
    .upsert({
      user_id: userIdDb,
      ...updateData
    })

  return NextResponse.json({
    success: true,
    streakData: {
      currentStreak: newStreak,
      longestStreak: updateData.longest_streak,
      lastActivityDate: todayStr,
      workoutStreak: newWorkoutStreak,
      nutritionStreak: newNutritionStreak
    }
  })
}
