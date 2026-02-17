import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// Real-time synchronization endpoint for progress data
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const body = await request.json()

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
    const { syncType, data } = body

    let syncResult: { updated: number; errors: string[] } = { updated: 0, errors: [] }

    switch (syncType) {
      case 'workout':
        syncResult = await syncWorkoutData(supabase, userIdDb, data)
        break
      case 'nutrition':
        syncResult = await syncNutritionData(supabase, userIdDb, data)
        break
      case 'progress':
        syncResult = await syncProgressData(supabase, userIdDb, data)
        break
      case 'full':
        syncResult = await syncAllData(supabase, userIdDb, data)
        break
      default:
        return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })
    }

    // Trigger real-time insights generation
    if (syncResult.updated > 0) {
      await triggerInsightGeneration(supabase, userIdDb)
    }

    return NextResponse.json({
      success: true,
      syncResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Real-time sync API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Sync workout data and update progress
async function syncWorkoutData(supabase: any, userId: string, data: any): Promise<{ updated: number; errors: string[] }> {
  const { workoutDate, exercises } = data
  let updated = 0
  const errors: string[] = []

  try {
    // Update workout tracking records
    for (const exercise of exercises) {
      const { error } = await supabase
        .from('workout_tracking')
        .upsert({
          user_id: userId,
          workout_date: workoutDate,
          workout_day_name: exercise.workoutDayName,
          exercise_name: exercise.exerciseName,
          completed_sets: exercise.completedSets,
          completed_reps: exercise.completedReps,
          completed_weight: exercise.completedWeight,
          perceived_effort: exercise.perceivedEffort,
          notes: exercise.notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,workout_day_name,exercise_name,workout_date'
        })

      if (error) {
        errors.push(`Failed to sync ${exercise.exerciseName}: ${error.message}`)
      } else {
        updated++
      }
    }

    // Update workout session
    const totalExercises = exercises.length
    const totalSets = exercises.reduce((sum: number, ex: any) => sum + (ex.completedSets || 0), 0)
    const totalReps = exercises.reduce((sum: number, ex: any) => sum + (ex.completedReps || 0), 0)

    await supabase
      .from('workout_sessions')
      .upsert({
        user_id: userId,
        session_date: workoutDate,
        workout_day_name: exercises[0]?.workoutDayName || 'Workout',
        total_exercises: totalExercises,
        total_sets_completed: totalSets,
        total_reps_completed: totalReps,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_date,workout_day_name'
      })

    // Update daily progress summary
    await updateDailyProgress(supabase, userId, workoutDate, {
      workoutsCompleted: 1,
      exercisesCompleted: totalExercises,
      setsCompleted: totalSets,
      repsCompleted: totalReps
    })

    // Update streak
    await updateActivityStreak(supabase, userId, workoutDate, 'workout')

  } catch (error) {
    errors.push(`Workout sync failed: ${error}`)
  }

  return { updated, errors }
}

// Sync nutrition data and update progress
async function syncNutritionData(supabase: any, userId: string, data: any): Promise<{ updated: number; errors: string[] }> {
  const { date, nutritionData } = data
  let updated = 0
  const errors: string[] = []

  try {
    // Insert nutrition tracking records
    for (const meal of nutritionData) {
      const { error } = await supabase
        .from('nutrition_tracking')
        .insert({
          user_id: userId,
          calories_consumed: meal.calories,
          protein_consumed: meal.protein,
          carbs_consumed: meal.carbs,
          fat_consumed: meal.fat,
          calories_required: meal.caloriesRequired || 2000,
          protein_required: meal.proteinRequired || 150,
          carbs_required: meal.carbsRequired || 250,
          fat_required: meal.fatRequired || 65,
          timestamp: new Date().toISOString()
        })

      if (error) {
        errors.push(`Failed to sync nutrition: ${error.message}`)
      } else {
        updated++
      }
    }

    // Calculate daily totals
    const totalCalories = nutritionData.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0)
    const totalProtein = nutritionData.reduce((sum: number, meal: any) => sum + (meal.protein || 0), 0)
    const totalCarbs = nutritionData.reduce((sum: number, meal: any) => sum + (meal.carbs || 0), 0)
    const totalFat = nutritionData.reduce((sum: number, meal: any) => sum + (meal.fat || 0), 0)

    // Update daily progress summary
    await updateDailyProgress(supabase, userId, date, {
      caloriesConsumed: totalCalories,
      proteinConsumed: totalProtein,
      carbsConsumed: totalCarbs,
      fatConsumed: totalFat
    })

    // Update streak
    await updateActivityStreak(supabase, userId, date, 'nutrition')

  } catch (error) {
    errors.push(`Nutrition sync failed: ${error}`)
  }

  return { updated, errors }
}

// Sync general progress data
async function syncProgressData(supabase: any, userId: string, data: any): Promise<{ updated: number; errors: string[] }> {
  const { date, progressData } = data
  let updated = 0
  const errors: string[] = []

  try {
    await updateDailyProgress(supabase, userId, date, progressData)
    updated++
  } catch (error) {
    errors.push(`Progress sync failed: ${error}`)
  }

  return { updated, errors }
}

// Sync all data types
async function syncAllData(supabase: any, userId: string, data: any): Promise<{ updated: number; errors: string[] }> {
  const results = {
    workout: { updated: 0, errors: [] as string[] },
    nutrition: { updated: 0, errors: [] as string[] },
    progress: { updated: 0, errors: [] as string[] }
  }

  if (data.workout) {
    results.workout = await syncWorkoutData(supabase, userId, data.workout)
  }
  if (data.nutrition) {
    results.nutrition = await syncNutritionData(supabase, userId, data.nutrition)
  }
  if (data.progress) {
    results.progress = await syncProgressData(supabase, userId, data.progress)
  }

  return {
    updated: results.workout.updated + results.nutrition.updated + results.progress.updated,
    errors: [...results.workout.errors, ...results.nutrition.errors, ...results.progress.errors]
  }
}

// Helper function to update daily progress
async function updateDailyProgress(supabase: any, userId: string, date: string, data: any) {
  const { data: existing, error: fetchError } = await supabase
    .from('daily_progress_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('summary_date', date)
    .single()

  const updateData: any = { updated_at: new Date().toISOString() }

  // Add or update provided values
  if (data.workoutsCompleted !== undefined) {
    updateData.workouts_completed = existing 
      ? (existing.workouts_completed || 0) + data.workoutsCompleted
      : data.workoutsCompleted
  }
  if (data.exercisesCompleted !== undefined) {
    updateData.exercises_completed = existing
      ? (existing.exercises_completed || 0) + data.exercisesCompleted
      : data.exercisesCompleted
  }
  if (data.setsCompleted !== undefined) {
    updateData.total_sets_completed = existing
      ? (existing.total_sets_completed || 0) + data.setsCompleted
      : data.setsCompleted
  }
  if (data.repsCompleted !== undefined) {
    updateData.total_reps_completed = existing
      ? (existing.total_reps_completed || 0) + data.repsCompleted
      : data.repsCompleted
  }
  if (data.caloriesConsumed !== undefined) {
    updateData.total_calories_consumed = existing
      ? (existing.total_calories_consumed || 0) + data.caloriesConsumed
      : data.caloriesConsumed
  }
  if (data.proteinConsumed !== undefined) {
    updateData.total_protein_consumed = existing
      ? (existing.total_protein_consumed || 0) + data.proteinConsumed
      : data.proteinConsumed
  }
  if (data.carbsConsumed !== undefined) {
    updateData.total_carbs_consumed = existing
      ? (existing.total_carbs_consumed || 0) + data.carbsConsumed
      : data.carbsConsumed
  }
  if (data.fatConsumed !== undefined) {
    updateData.total_fat_consumed = existing
      ? (existing.total_fat_consumed || 0) + data.fatConsumed
      : data.fatConsumed
  }

  // Calculate day score
  let dayScore = 0
  if (updateData.workouts_completed > 0) dayScore += 30
  if (updateData.exercises_completed > 0) dayScore += 20
  if (updateData.total_calories_consumed > 0) dayScore += 25
  if (updateData.total_protein_consumed > 0) dayScore += 25
  updateData.day_score = Math.min(100, dayScore)

  if (existing) {
    await supabase
      .from('daily_progress_summary')
      .update(updateData)
      .eq('id', existing.id)
  } else {
    await supabase
      .from('daily_progress_summary')
      .insert({
        user_id: userId,
        summary_date: date,
        ...updateData
      })
  }
}

// Helper function to update activity streak
async function updateActivityStreak(supabase: any, userId: string, date: string, activityType: string) {
  try {
    await supabase.rpc('update_activity_streak', {
      p_user_id: userId,
      activity_date: date
    })
  } catch (error) {
    console.error('Failed to update streak:', error)
  }
}

// Trigger insight generation
async function triggerInsightGeneration(supabase: any, userId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/progress/generate-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
  } catch (error) {
    console.error('Failed to trigger insight generation:', error)
  }
}
