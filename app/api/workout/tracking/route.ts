import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/database'
import { supabaseService } from '@/lib/supabase'

// GET /api/workout/tracking - Get workout tracking data
export async function GET(request: NextRequest) {
  console.log('=== WORKOUT TRACKING GET API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // Format: YYYY-MM-DD
    const workoutDay = searchParams.get('workoutDay')

    let query = supabaseService
      .from('workout_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('workout_date', date)
    }

    if (workoutDay) {
      query = query.eq('workout_day_name', workoutDay)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching workout tracking:', error)
      return NextResponse.json({ error: 'Failed to fetch workout data' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Workout Tracking GET API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/workout/tracking - Update workout tracking data
export async function POST(request: NextRequest) {
  console.log('=== WORKOUT TRACKING POST API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const body = await request.json()

    const {
      workout_day_name,
      exercise_name,
      completed_sets,
      completed_reps,
      completed_weight,
      actual_rest_time,
      perceived_effort,
      form_quality,
      notes
    } = body

    if (!workout_day_name || !exercise_name) {
      return NextResponse.json({ error: 'workout_day_name and exercise_name are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert workout tracking data
    const { data, error } = await supabaseService
      .from('workout_tracking')
      .upsert({
        user_id: userId,
        workout_day_name,
        exercise_name,
        workout_date: today,
        completed_sets: completed_sets || 0,
        completed_reps: completed_reps || 0,
        completed_weight: completed_weight || null,
        actual_rest_time: actual_rest_time || 0,
        perceived_effort: perceived_effort || null,
        form_quality: form_quality || null,
        notes: notes || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,workout_day_name,exercise_name,workout_date',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Error updating workout tracking:', error)
      return NextResponse.json({ error: 'Failed to update workout data' }, { status: 500 })
    }

    // Update streak when workout is tracked
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/progress/streak-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_activity',
          activityType: 'workout',
          activityData: {
            workout_day_name,
            exercise_name,
            workout_date: today
          }
        })
      })
    } catch (error) {
      console.error('Error updating workout streak:', error)
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Workout tracking updated successfully'
    })

  } catch (error) {
    console.error('Workout Tracking POST API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/workout/tracking - Complete workout session
export async function PUT(request: NextRequest) {
  console.log('=== WORKOUT SESSION COMPLETE API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const body = await request.json()

    const {
      workout_day_name,
      session_notes,
      perceived_difficulty,
      session_duration
    } = body

    if (!workout_day_name) {
      return NextResponse.json({ error: 'workout_day_name is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get workout summary for the day
    const { data: workoutData, error: workoutError } = await supabaseService
      .from('workout_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_date', today)
      .eq('workout_day_name', workout_day_name)

    if (workoutError) {
      console.error('Error fetching workout data:', workoutError)
      return NextResponse.json({ error: 'Failed to fetch workout data' }, { status: 500 })
    }

    // Calculate session totals
    const totalExercises = workoutData?.length || 0
    const totalSetsPlanned = workoutData?.reduce((sum, ex) => sum + (ex.required_sets || 0), 0) || 0
    const totalSetsCompleted = workoutData?.reduce((sum, ex) => sum + (ex.completed_sets || 0), 0) || 0
    const totalRepsPlanned = workoutData?.reduce((sum, ex) => sum + (ex.required_reps || 0), 0) || 0
    const totalRepsCompleted = workoutData?.reduce((sum, ex) => sum + (ex.completed_reps || 0), 0) || 0
    const averageRestTime = workoutData?.reduce((sum, ex) => sum + (ex.actual_rest_time || 0), 0) / Math.max(totalSetsCompleted, 1) || 0

    // Create or update workout session
    const { data: sessionData, error: sessionError } = await supabaseService
      .from('workout_sessions')
      .upsert({
        user_id: userId,
        session_date: today,
        workout_day_name,
        total_exercises: totalExercises,
        total_sets_planned: totalSetsPlanned,
        total_sets_completed: totalSetsCompleted,
        total_reps_planned: totalRepsPlanned,
        total_reps_completed: totalRepsCompleted,
        session_duration: session_duration || null,
        average_rest_time: Math.round(averageRestTime),
        perceived_difficulty: perceived_difficulty || null,
        session_notes: session_notes || '',
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_date,workout_day_name',
        ignoreDuplicates: false
      })
      .select()

    if (sessionError) {
      console.error('Error creating workout session:', sessionError)
      return NextResponse.json({ error: 'Failed to create workout session' }, { status: 500 })
    }

    // Generate AI feedback (optional - could call another AI service)
    const completionPercentage = totalSetsPlanned > 0 ? (totalSetsCompleted / totalSetsPlanned) * 100 : 0
    let aiFeedback = `Great job completing ${workout_day_name}! `
    
    if (completionPercentage >= 100) {
      aiFeedback += 'You completed all planned sets. Excellent consistency!'
    } else if (completionPercentage >= 80) {
      aiFeedback += `You completed ${Math.round(completionPercentage)}% of planned sets. Good effort!`
    } else {
      aiFeedback += `You completed ${Math.round(completionPercentage)}% of planned sets. Consider adjusting the intensity next time.`
    }

    if (perceived_difficulty && perceived_difficulty >= 8) {
      aiFeedback += ' The workout was challenging - make sure to recover properly.'
    }

    // Update session with AI feedback
    await supabaseService
      .from('workout_sessions')
      .update({ ai_feedback: aiFeedback })
      .eq('id', sessionData[0].id)

    return NextResponse.json({ 
      success: true, 
      data: {
        session: sessionData[0],
        summary: {
          totalExercises,
          totalSetsPlanned,
          totalSetsCompleted,
          totalRepsPlanned,
          totalRepsCompleted,
          completionPercentage: Math.round(completionPercentage),
          averageRestTime: Math.round(averageRestTime)
        },
        aiFeedback
      },
      message: 'Workout session completed successfully'
    })

  } catch (error) {
    console.error('Workout Session Complete API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
