import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// API to create sample data for testing
export async function POST() {
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
    const today = new Date()

    // Create sample workout data
    const workoutData = [
      {
        user_id: userIdDb,
        workout_date: today.toISOString().split('T')[0],
        workout_day_name: 'Monday',
        exercise_name: 'Bench Press',
        completed_sets: 4,
        completed_reps: 10,
        completed_weight: '80kg',
        perceived_effort: 7,
        notes: 'Felt strong today'
      },
      {
        user_id: userIdDb,
        workout_date: today.toISOString().split('T')[0],
        workout_day_name: 'Monday',
        exercise_name: 'Squats',
        completed_sets: 4,
        completed_reps: 12,
        completed_weight: '100kg',
        perceived_effort: 8,
        notes: 'Good depth'
      }
    ]

    // Create sample nutrition data
    const nutritionData = [
      {
        user_id: userIdDb,
        calories_consumed: 2200,
        protein_consumed: 180,
        carbs_consumed: 250,
        fat_consumed: 70,
        calories_required: 2000,
        protein_required: 150,
        carbs_required: 250,
        fat_required: 65,
        timestamp: today.toISOString()
      }
    ]

    // Create sample personal records
    const personalRecords = [
      {
        user_id: userIdDb,
        exercise_name: 'Bench Press',
        pr_type: 'weight',
        pr_value: 85,
        pr_date: today.toISOString().split('T')[0],
        details: 'New 1RM achieved'
      }
    ]

    // Create sample AI insights
    const aiInsights = [
      {
        user_id: userIdDb,
        insight_type: 'achievement',
        category: 'workout',
        title: 'New Personal Record!',
        message: 'You set a new PR on Bench Press today!',
        actionable_advice: 'Keep pushing your limits gradually and safely.',
        priority_level: 4,
        relevance_score: 0.9,
        is_read: false,
        is_bookmarked: false,
        generated_at: today.toISOString(),
        based_on_data: 'workout_tracking'
      }
    ]

    // Insert all sample data
    const [workoutResult, nutritionResult, recordsResult, insightsResult] = await Promise.all([
      supabase.from('workout_tracking').insert(workoutData),
      supabase.from('nutrition_tracking').insert(nutritionData),
      supabase.from('personal_records').insert(personalRecords),
      supabase.from('ai_insights').insert(aiInsights)
    ])

    // Check for errors
    const errors = []
    if (workoutResult.error) errors.push(`Workout: ${workoutResult.error.message}`)
    if (nutritionResult.error) errors.push(`Nutrition: ${nutritionResult.error.message}`)
    if (recordsResult.error) errors.push(`Records: ${recordsResult.error.message}`)
    if (insightsResult.error) errors.push(`Insights: ${insightsResult.error.message}`)

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some data failed to insert',
        details: errors 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      dataInserted: {
        workouts: workoutData.length,
        nutrition: nutritionData.length,
        records: personalRecords.length,
        insights: aiInsights.length
      }
    })

  } catch (error) {
    console.error('Sample data creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
