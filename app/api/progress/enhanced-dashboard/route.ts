import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// Simplified API that works with existing tables
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const includeRealTime = searchParams.get('realTime') === 'true'

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

    // Fetch user's daily goals from database
    const { data: userGoals, error: goalsError } = await supabase
      .from('users')
      .select('daily_calorie_goal, daily_protein_goal')
      .eq('user_id', userIdDb)
      .single()

    // Calculate date range
    const today = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(today.getDate() - 7)
        break
      case '30d':
        startDate.setDate(today.getDate() - 30)
        break
      case '90d':
        startDate.setDate(today.getDate() - 90)
        break
    }

    const startDateStr = startDate.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    // Fetch data from existing tables
    const [
      { data: workouts, error: workoutsError },
      { data: nutrition, error: nutritionError },
      { data: personalRecords, error: recordsError },
      { data: aiInsights, error: insightsError },
      { data: streakData, error: streakError }
    ] = await Promise.all([
      // Fetch workout tracking data
      supabase
        .from('workout_tracking')
        .select('*')
        .eq('user_id', userIdDb)
        .gte('workout_date', startDateStr)
        .order('workout_date', { ascending: false }),
      
      // Fetch nutrition tracking data
      supabase
        .from('nutrition_tracking')
        .select('*')
        .eq('user_id', userIdDb)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false }),
      
      // Fetch personal records
      supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userIdDb)
        .order('pr_date', { ascending: false })
        .limit(10),
      
      // Fetch AI insights
      supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userIdDb)
        .order('generated_at', { ascending: false })
        .limit(10),

      // Fetch streak data
      supabase
        .from('progress_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', userIdDb)
        .single()
    ])

    // Calculate progress metrics from real data
    const todayWorkouts = workouts?.filter(w => w.workout_date === todayStr) || []
    const todayNutrition = nutrition?.filter(n => 
      new Date(n.timestamp).toISOString().split('T')[0] === todayStr
    ) || []

    // Calculate today's metrics
    const todayExercises = todayWorkouts.length > 0 
      ? [...new Set(todayWorkouts.map(w => w.exercise_name))].length 
      : 0
    
    const todaySets = todayWorkouts.reduce((sum, w) => sum + (w.completed_sets || 0), 0)
    const todayReps = todayWorkouts.reduce((sum, w) => sum + (w.completed_reps || 0), 0)
    const todayCalories = todayNutrition.reduce((sum, n) => sum + (n.calories_consumed || 0), 0)
    const todayProtein = todayNutrition.reduce((sum, n) => sum + (n.protein_consumed || 0), 0)

    // Get daily goals from user table or defaults
    const dailyCalorieGoal = userGoals?.daily_calorie_goal || 2200
    const dailyProteinGoal = userGoals?.daily_protein_goal || 150

    // Calculate nutrition requirements
    const totalCaloriesRequired = todayNutrition.reduce((sum, n) => sum + (n.calories_required || 2000), 0) || 2000
    const totalProteinRequired = todayNutrition.reduce((sum, n) => sum + (n.protein_required || 150), 0) || 150

    // Calculate workout requirements
    const totalRequiredSets = todayWorkouts.reduce((sum, w) => sum + (w.required_sets || 0), 0)
    const totalCompletedSets = todaySets

    // Calculate period totals based on time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90

    // Get data for the period
    const weeklyWorkouts = workouts?.filter(w => w.workout_date >= startDateStr) || []
    const weeklyNutrition = nutrition?.filter((n: any) => 
      new Date(n.timestamp) >= startDate
    ) || []

    // Calculate total targets: daily goal * number of days
    const totalTargetCalories = dailyCalorieGoal * days
    const totalTargetProtein = dailyProteinGoal * days

    // Calculate total consumed in period
    const totalConsumedCalories = weeklyNutrition.reduce((sum, n) => sum + (n.calories_consumed || 0), 0)
    const totalConsumedProtein = weeklyNutrition.reduce((sum, n) => sum + (n.protein_consumed || 0), 0)

    // Calculate compliance percentages
    const calorieCompliance = totalTargetCalories > 0 ? Math.min(100, (totalConsumedCalories / totalTargetCalories) * 100) : 0
    const proteinCompliance = totalTargetProtein > 0 ? Math.min(100, (totalConsumedProtein / totalTargetProtein) * 100) : 0

    // Remove weekly averages (no longer needed)
    // const weeklyAvgCalories = ...
    // const weeklyAvgProtein = ...

    // Calculate streak based on activity and database
    let currentStreak = streakData?.current_streak || 0
    let longestStreak = streakData?.longest_streak || 0
    const lastActivityDate = streakData?.last_activity_date

    const hasActivityToday = todayWorkouts.length > 0 || todayNutrition.length > 0

    // Use the streak manager to calculate correct streak
    try {
      const streakResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/progress/streak-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          action: 'check_activity',
          userId: userIdDb
        })
      })
      
      if (streakResponse.ok) {
        const streakResult = await streakResponse.json()
        currentStreak = streakResult.streakData.currentStreak
        longestStreak = streakResult.streakData.longestStreak
      }
    } catch (error) {
      console.error('Error checking streak:', error)
      // Fallback to existing logic
      if (hasActivityToday) {
        if (lastActivityDate !== todayStr) {
          currentStreak += 1
          longestStreak = Math.max(longestStreak, currentStreak)
          // Update the streak table
          await supabase
            .from('progress_streaks')
            .upsert({
              user_id: userIdDb,
              current_streak: currentStreak,
              longest_streak: longestStreak,
              last_activity_date: todayStr
            })
        }
      } else {
        // No activity today - check if streak should be reset
        if (lastActivityDate && lastActivityDate !== todayStr) {
          const lastActivity = new Date(lastActivityDate)
          const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff >= 1) {
            currentStreak = 0
            await supabase
              .from('progress_streaks')
              .update({ current_streak: 0 })
              .eq('user_id', userIdDb)
          }
        }
      }
    }

    // Calculate day score based on completion of goals
    const nutritionCompletion = todayNutrition.length > 0 ? 
      (Math.min(todayCalories / totalCaloriesRequired, 1) + Math.min(todayProtein / totalProteinRequired, 1)) / 2 : 0
    const nutritionScore = nutritionCompletion * 50

    const workoutCompletion = totalRequiredSets > 0 ? Math.min(totalCompletedSets / totalRequiredSets, 1) : 0
    const workoutScore = workoutCompletion * 50

    const dayScore = Math.round(Math.min(100, nutritionScore + workoutScore))

    // Build progress data object
    const progressData = {
      currentStreak,
      longestStreak,
      todayWorkouts: todayWorkouts.length > 0 ? 1 : 0,
      todayExercises,
      todaySets,
      todayReps,
      todayCalories,
      todayProtein,
      todayScore: dayScore,
      totalConsumedCalories,
      totalConsumedProtein,
      totalTargetCalories,
      totalTargetProtein,
      calorieCompliance,
      proteinCompliance,
      recentPRsCount: personalRecords?.length || 0,
      unreadInsightsCount: aiInsights?.filter(i => !i.is_read).length || 0,
      achievedMilestonesCount: 0, // Placeholder
      activeToday: todayWorkouts.length > 0 || todayNutrition.length > 0
    }

    // Generate real-time insights if requested
    const realTimeInsights: any[] = []
    if (includeRealTime && todayWorkouts.length > 0) {
      realTimeInsights.push({
        id: Date.now(),
        type: 'motivation',
        category: 'workout',
        title: 'Great Workout!',
        message: `You completed ${todayExercises} exercises today!`,
        actionableAdvice: 'Keep up the good work!',
        priorityLevel: 3,
        generatedAt: new Date().toISOString(),
        isRead: false,
        isBookmarked: false
      })
    }

    // Build metadata
    const metadata = {
      timeRange,
      workoutFrequency: weeklyWorkouts.length > 0 ? Math.round((weeklyWorkouts.length / 7) * 7) : 0,
      nutritionTrackingDays: weeklyNutrition.length > 0 ? [...new Set(weeklyNutrition.map(n => 
        new Date(n.timestamp).toISOString().split('T')[0]
      ))].length : 0,
      avgWorkoutEffort: 5, // Placeholder
      dataFreshness: new Date().toISOString(),
      errors: {
        progress: !!workoutsError,
        records: !!recordsError,
        insights: !!insightsError,
        workouts: !!workoutsError,
        nutrition: !!nutritionError,
        weekly: false
      }
    }

    return NextResponse.json({
      progressData,
      personalRecords: personalRecords || [],
      aiInsights: aiInsights || [],
      realTimeInsights,
      metadata,
      success: true
    })

  } catch (error) {
    console.error('Enhanced dashboard API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
