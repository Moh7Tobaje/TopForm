import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// AI Insight generation logic
function generateInsights(userData: any, progressData: any, workoutData: any, nutritionData: any) {
  const insights = []

  // Streak-based insights
  if (userData.current_streak >= 7) {
    insights.push({
      type: 'achievement',
      category: 'consistency',
      title: `🔥 ${userData.current_streak} Day Streak!`,
      message: `Amazing consistency! You've been active for ${userData.current_streak} consecutive days.`,
      actionableAdvice: 'Keep this momentum going! Try to add variety to prevent burnout.',
      priorityLevel: 5,
      relevanceScore: 0.9
    })
  }

  if (userData.current_streak === userData.longest_streak && userData.current_streak >= 3) {
    insights.push({
      type: 'achievement',
      category: 'consistency',
      title: '🏆 Personal Best Streak!',
      message: `You've matched your longest streak of ${userData.longest_streak} days!`,
      actionableAdvice: 'This is your peak performance. Document what\'s working well for you.',
      priorityLevel: 4,
      relevanceScore: 0.85
    })
  }

  // Workout performance insights
  if (progressData.today_workouts > 0) {
    insights.push({
      type: 'motivation',
      category: 'workout',
      title: '💪 Great Workout Today!',
      message: `You completed ${progressData.today_workouts} workout(s) today with ${progressData.today_exercises} exercises.`,
      actionableAdvice: 'Proper recovery is key. Consider stretching or light cardio tomorrow.',
      priorityLevel: 3,
      relevanceScore: 0.8
    })
  }

  // Nutrition insights
  const proteinCompliance = progressData.protein_compliance || 0
  const calorieCompliance = progressData.calorie_compliance || 0

  if (proteinCompliance < 60) {
    insights.push({
      type: 'recommendation',
      category: 'nutrition',
      title: '🥩 Increase Protein Intake',
      message: `Your protein compliance is only ${proteinCompliance}%. You might need more protein for muscle recovery.`,
      actionableAdvice: 'Try adding protein-rich foods like chicken, eggs, or protein shakes to your meals.',
      priorityLevel: 4,
      relevanceScore: 0.75
    })
  }

  if (calorieCompliance > 120) {
    insights.push({
      type: 'warning',
      category: 'nutrition',
      title: '⚠️ High Calorie Intake',
      message: `Your calorie intake is ${calorieCompliance}% of target. Consider portion control.`,
      actionableAdvice: 'Focus on nutrient-dense foods and track your portions more carefully.',
      priorityLevel: 3,
      relevanceScore: 0.7
    })
  }

  // Personal Record insights
  if (progressData.recent_prs_count > 0) {
    insights.push({
      type: 'achievement',
      category: 'workout',
      title: '🎯 New Personal Records!',
      message: `You set ${progressData.recent_prs_count} new PR(s) recently! Your strength is improving.`,
      actionableAdvice: 'Progressive overload is working. Consider slightly increasing weights next session.',
      priorityLevel: 5,
      relevanceScore: 0.95
    })
  }

  // Pattern-based insights
  if (workoutData && workoutData.length > 0) {
    const recentWorkouts = workoutData.slice(-7) // Last 7 workouts
    const avgEffort = recentWorkouts.reduce((acc: number, w: any) => acc + (w.perceived_effort || 5), 0) / recentWorkouts.length

    if (avgEffort > 8) {
      insights.push({
        type: 'recommendation',
        category: 'recovery',
        title: '🧘 High Intensity Detected',
        message: 'Your recent workouts have been very intense. Recovery is crucial.',
        actionableAdvice: 'Consider a deload week or active recovery with light cardio and stretching.',
        priorityLevel: 3,
        relevanceScore: 0.8
      })
    }
  }

  // Motivational insights
  if (userData.current_streak === 0) {
    insights.push({
      type: 'motivation',
      category: 'consistency',
      title: '🌟 Start Your Journey',
      message: 'Every champion was once a beginner. Today is the perfect day to start!',
      actionableAdvice: 'Begin with a 15-minute workout or track your first meal. Small steps lead to big changes.',
      priorityLevel: 4,
      relevanceScore: 0.9
    })
  }

  // Goal-based insights
  if (progressData.achieved_milestones_count > 0) {
    insights.push({
      type: 'achievement',
      category: 'goal',
      title: '🎊 Milestones Achieved!',
      message: `You've achieved ${progressData.achieved_milestones_count} milestone(s). Keep crushing your goals!`,
      actionableAdvice: 'Set new challenging goals to maintain your motivation and progress.',
      priorityLevel: 4,
      relevanceScore: 0.85
    })
  }

  return insights
}

export async function POST(request: Request) {
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

    // Fetch comprehensive user data
    const [
      { data: progressData },
      { data: streakData },
      { data: workoutData },
      { data: nutritionData }
    ] = await Promise.all([
      supabase.from('progress_dashboard').select('*').eq('user_id', userIdDb).single(),
      supabase.from('progress_streaks').select('*').eq('user_id', userIdDb).single(),
      supabase.from('workout_tracking').select('*').eq('user_id', userIdDb).order('workout_date', { ascending: false }).limit(7),
      supabase.from('nutrition_tracking').select('*').eq('user_id', userIdDb).order('timestamp', { ascending: false }).limit(7)
    ])

    // Generate insights based on data
    const insights = generateInsights(
      streakData || { current_streak: 0, longest_streak: 0 },
      progressData || {},
      workoutData || [],
      nutritionData || []
    )

    // Save insights to database
    const savedInsights = []
    for (const insight of insights) {
      const { data: savedInsight, error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userIdDb,
          insight_type: insight.type,
          insight_category: insight.category,
          title: insight.title,
          message: insight.message,
          actionable_advice: insight.actionableAdvice,
          priority_level: insight.priorityLevel,
          relevance_score: insight.relevanceScore,
          based_on_data: { progressData, streakData, workoutData, nutritionData },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (!insertError && savedInsight) {
        savedInsights.push({
          id: savedInsight.id,
          type: savedInsight.insight_type,
          category: savedInsight.insight_category,
          title: savedInsight.title,
          message: savedInsight.message,
          actionableAdvice: savedInsight.actionable_advice,
          priorityLevel: savedInsight.priority_level,
          generatedAt: savedInsight.generated_at
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      insightsGenerated: insights.length,
      insightsSaved: savedInsights.length,
      insights: savedInsights
    })

  } catch (error) {
    console.error('Generate insights API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
