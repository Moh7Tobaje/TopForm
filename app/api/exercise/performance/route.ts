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

    const performanceData = await request.json()
    
    // Check if this is a personal record
    const { data: previousPerformance } = await supabase
      .from('exercise_performance')
      .select('one_rep_max_estimated')
      .eq('user_id', userData.user_id)
      .eq('exercise_name', performanceData.exercise_name)
      .order('one_rep_max_estimated', { ascending: false })
      .limit(1)

    const isPersonalRecord = previousPerformance && previousPerformance.length > 0 
      ? performanceData.one_rep_max_estimated > previousPerformance[0].one_rep_max_estimated
      : true

    // Insert exercise performance record
    const { data, error } = await supabase
      .from('exercise_performance')
      .insert({
        user_id: userData.user_id,
        exercise_name: performanceData.exercise_name,
        weight_used: performanceData.weight_used,
        reps_completed: performanceData.reps_completed,
        sets_completed: performanceData.sets_completed,
        one_rep_max_estimated: performanceData.one_rep_max_estimated,
        volume_total: performanceData.volume_total,
        personal_record: isPersonalRecord,
        progression_type: performanceData.progression_type,
        performance_date: new Date().toISOString().split('T')[0]
      })
      .select()

    if (error) {
      console.error('Exercise performance error:', error)
      return NextResponse.json({ error: 'Failed to save exercise performance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      isPersonalRecord,
      message: isPersonalRecord 
        ? 'New personal record achieved! 🏆' 
        : 'Exercise performance saved successfully'
    })

  } catch (error) {
    console.error('Exercise performance API error:', error)
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
    const exercise = searchParams.get('exercise')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('exercise_performance')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('performance_date', { ascending: false })
      .limit(limit)

    if (exercise) {
      query = query.eq('exercise_name', exercise)
    }

    const { data, error } = await query

    if (error) {
      console.error('Exercise performance fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch exercise performance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || []
    })

  } catch (error) {
    console.error('Exercise performance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
