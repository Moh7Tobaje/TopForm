import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService

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

    // Fetch comprehensive progress data using the progress_dashboard view
    const { data: progressData, error: progressError } = await supabase
      .from('progress_dashboard')
      .select('*')
      .eq('user_id', userIdDb)
      .single()

    if (progressError) {
      console.error('Progress dashboard error:', progressError)
      // If view doesn't exist or no data, return default values
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        todayWorkouts: 0,
        todayExercises: 0,
        todaySets: 0,
        todayCalories: 0,
        todayProtein: 0,
        todayScore: 0,
        weeklyAvgCalories: 0,
        weeklyAvgProtein: 0,
        calorieCompliance: 0,
        proteinCompliance: 0,
        recentPRsCount: 0,
        unreadInsightsCount: 0,
        achievedMilestonesCount: 0
      })
    }

    // Format the response
    const response = {
      currentStreak: progressData.current_streak || 0,
      longestStreak: progressData.longest_streak || 0,
      todayWorkouts: progressData.today_workouts || 0,
      todayExercises: progressData.today_exercises || 0,
      todaySets: progressData.today_sets || 0,
      todayCalories: Math.round(progressData.today_calories || 0),
      todayProtein: Math.round(progressData.today_protein || 0),
      todayScore: progressData.today_score || 0,
      weeklyAvgCalories: Math.round(progressData.weekly_avg_calories || 0),
      weeklyAvgProtein: Math.round(progressData.weekly_avg_protein || 0),
      calorieCompliance: Math.round(progressData.calorie_compliance_percentage || 0),
      proteinCompliance: Math.round(progressData.protein_compliance_percentage || 0),
      recentPRsCount: progressData.recent_prs_count || 0,
      unreadInsightsCount: progressData.unread_insights_count || 0,
      achievedMilestonesCount: progressData.achieved_milestones_count || 0
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
