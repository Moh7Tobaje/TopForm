import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set up Supabase environment variables.',
        code: 'DATABASE_NOT_CONFIGURED'
      }, { status: 503 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const sessionData = await request.json()
    
    // Insert or update workout session
    const { data, error } = await supabase
      .from('workout_sessions')
      .upsert({
        user_id: userData.user_id,
        session_date: sessionData.session_date,
        workout_day_name: sessionData.workout_day_name,
        total_exercises: sessionData.total_exercises,
        total_sets_planned: sessionData.total_sets_planned,
        total_sets_completed: sessionData.total_sets_completed,
        total_reps_planned: sessionData.total_reps_planned,
        total_reps_completed: sessionData.total_reps_completed,
        session_duration: sessionData.session_duration,
        average_rest_time: sessionData.average_rest_time,
        perceived_difficulty: sessionData.perceived_difficulty,
        status: sessionData.status,
        session_notes: sessionData.session_notes,
        ai_feedback: sessionData.ai_feedback,
        started_at: new Date().toISOString(),
        completed_at: sessionData.status === 'completed' ? new Date().toISOString() : null
      })
      .select()

    if (error) {
      console.error('Workout session error:', error)
      return NextResponse.json({ error: 'Failed to save workout session' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Workout session saved successfully'
    })

  } catch (error) {
    console.error('Workout session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set up Supabase environment variables.',
        code: 'DATABASE_NOT_CONFIGURED'
      }, { status: 503 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const workoutDay = searchParams.get('workoutDay')

    let query = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('session_date', { ascending: false })

    if (date) {
      query = query.eq('session_date', date)
    }
    if (workoutDay) {
      query = query.eq('workout_day_name', workoutDay)
    }

    const { data, error } = await query

    if (error) {
      console.error('Workout sessions fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch workout sessions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || []
    })

  } catch (error) {
    console.error('Workout sessions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
