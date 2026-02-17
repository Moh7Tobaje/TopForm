import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

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

    const { 
      date = new Date().toISOString().split('T')[0],
      workoutsCompleted,
      exercisesCompleted,
      setsCompleted,
      repsCompleted,
      caloriesConsumed,
      proteinConsumed,
      carbsConsumed,
      fatConsumed
    } = body

    // Check if daily summary exists
    const { data: existingSummary, error: fetchError } = await supabase
      .from('daily_progress_summary')
      .select('*')
      .eq('user_id', userIdDb)
      .eq('summary_date', date)
      .single()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Add provided values to existing data or set new values
    if (workoutsCompleted !== undefined) {
      updateData.workouts_completed = existingSummary 
        ? (existingSummary.workouts_completed || 0) + workoutsCompleted
        : workoutsCompleted
    }
    if (exercisesCompleted !== undefined) {
      updateData.exercises_completed = existingSummary
        ? (existingSummary.exercises_completed || 0) + exercisesCompleted
        : exercisesCompleted
    }
    if (setsCompleted !== undefined) {
      updateData.total_sets_completed = existingSummary
        ? (existingSummary.total_sets_completed || 0) + setsCompleted
        : setsCompleted
    }
    if (repsCompleted !== undefined) {
      updateData.total_reps_completed = existingSummary
        ? (existingSummary.total_reps_completed || 0) + repsCompleted
        : repsCompleted
    }
    if (caloriesConsumed !== undefined) {
      updateData.total_calories_consumed = existingSummary
        ? (existingSummary.total_calories_consumed || 0) + caloriesConsumed
        : caloriesConsumed
    }
    if (proteinConsumed !== undefined) {
      updateData.total_protein_consumed = existingSummary
        ? (existingSummary.total_protein_consumed || 0) + proteinConsumed
        : proteinConsumed
    }
    if (carbsConsumed !== undefined) {
      updateData.total_carbs_consumed = existingSummary
        ? (existingSummary.total_carbs_consumed || 0) + carbsConsumed
        : carbsConsumed
    }
    if (fatConsumed !== undefined) {
      updateData.total_fat_consumed = existingSummary
        ? (existingSummary.total_fat_consumed || 0) + fatConsumed
        : fatConsumed
    }

    // Calculate day score based on activity
    let dayScore = 0
    if (updateData.workouts_completed > 0) dayScore += 30
    if (updateData.exercises_completed > 0) dayScore += 20
    if (updateData.total_calories_consumed > 0) dayScore += 25
    if (updateData.total_protein_consumed > 0) dayScore += 25
    updateData.day_score = Math.min(100, dayScore)

    if (existingSummary) {
      // Update existing summary
      const { data: updatedSummary, error: updateError } = await supabase
        .from('daily_progress_summary')
        .update(updateData)
        .eq('id', existingSummary.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update daily summary error:', updateError)
        return NextResponse.json({ error: 'Failed to update daily summary' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: updatedSummary })
    } else {
      // Create new summary
      const newSummaryData = {
        user_id: userIdDb,
        summary_date: date,
        ...updateData
      }

      const { data: newSummary, error: insertError } = await supabase
        .from('daily_progress_summary')
        .insert(newSummaryData)
        .select()
        .single()

      if (insertError) {
        console.error('Insert daily summary error:', insertError)
        return NextResponse.json({ error: 'Failed to create daily summary' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newSummary })
    }

  } catch (error) {
    console.error('Update daily progress API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
