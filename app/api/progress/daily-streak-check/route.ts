import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// API endpoint to check and reset streaks daily (can be called by cron job)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const body = await request.json()
    const { forceCheck } = body // Optional parameter to force check

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
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userIdDb)
      .single()

    if (streakError && streakError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const streakData = currentStreak || {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null
    }

    // Check if we need to reset streak (no activity yesterday and no activity today)
    let shouldReset = false
    let newStreak = streakData.current_streak

    if (streakData.last_activity_date) {
      const lastActivityDate = new Date(streakData.last_activity_date)
      const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // If more than 1 day has passed since last activity, reset streak
      if (daysDiff > 1) {
        shouldReset = true
        newStreak = 0
      }
    }

    // Check for today's activity to confirm if reset should happen
    const [
      { data: todayWorkouts },
      { data: todayNutrition }
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

    const hasActivityToday = (todayWorkouts && todayWorkouts.length > 0) || 
                           (todayNutrition && todayNutrition.length > 0)

    // If there's activity today, don't reset the streak
    if (hasActivityToday) {
      shouldReset = false
      // If last activity was before today, increment streak
      if (streakData.last_activity_date !== todayStr) {
        // Check yesterday's activity
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
          newStreak = streakData.current_streak + 1
        } else {
          // Check for gap
          if (streakData.last_activity_date) {
            const lastActivity = new Date(streakData.last_activity_date)
            const daysDiff = Math.floor((new Date(todayStr).getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
            if (daysDiff > 1) {
              newStreak = 1 // Start new streak
            } else {
              newStreak = streakData.current_streak + 1 // Continue streak
            }
          } else {
            newStreak = 1 // First activity
          }
        }
      }
    }

    // Update database if needed
    if (shouldReset || newStreak !== streakData.current_streak) {
      await supabase
        .from('progress_streaks')
        .upsert({
          user_id: userIdDb,
          current_streak: newStreak,
          longest_streak: Math.max(streakData.longest_streak || 0, newStreak),
          last_activity_date: hasActivityToday ? todayStr : streakData.last_activity_date,
          updated_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      streakData: {
        currentStreak: newStreak,
        longestStreak: Math.max(streakData.longest_streak || 0, newStreak),
        lastActivityDate: hasActivityToday ? todayStr : streakData.last_activity_date,
        hasActivityToday,
        shouldReset,
        daysSinceLastActivity: streakData.last_activity_date ? 
          Math.floor((today.getTime() - new Date(streakData.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)) : null
      }
    })

  } catch (error) {
    console.error('Daily streak check API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check current streak status
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

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

    // Get current streak data
    const { data: currentStreak, error: streakError } = await supabase
      .from('progress_streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userIdDb)
      .single()

    if (streakError && streakError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const streakData = currentStreak || {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null
    }

    let response: any = {
      currentStreak: streakData.current_streak,
      longestStreak: streakData.longest_streak,
      lastActivityDate: streakData.last_activity_date
    }

    if (detailed) {
      // Check today's activity
      const [
        { data: todayWorkouts },
        { data: todayNutrition }
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

      const hasActivityToday = (todayWorkouts && todayWorkouts.length > 0) || 
                             (todayNutrition && todayNutrition.length > 0)

      // Calculate days since last activity
      let daysSinceLastActivity = null
      if (streakData.last_activity_date) {
        const lastActivity = new Date(streakData.last_activity_date)
        daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      }

      response = {
        ...response,
        hasActivityToday,
        daysSinceLastActivity,
        todayWorkouts: todayWorkouts?.length || 0,
        todayNutritionEntries: todayNutrition?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      streakData: response
    })

  } catch (error) {
    console.error('Get streak status API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
