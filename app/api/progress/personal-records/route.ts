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

    // Fetch personal records
    const { data: personalRecords, error: recordsError } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userIdDb)
      .order('pr_date', { ascending: false })
      .limit(12) // Get recent 12 PRs

    if (recordsError) {
      console.error('Personal records error:', recordsError)
      return NextResponse.json([])
    }

    // Format the response
    const formattedRecords = personalRecords
      .filter((record: any) => record.weight_pr || record.reps_pr || record.volume_pr || record.time_pr)
      .map((record: any) => {
        let type: 'weight' | 'reps' | 'volume' | 'time'
        let value: number

        if (record.weight_pr) {
          type = 'weight'
          value = record.weight_pr
        } else if (record.reps_pr) {
          type = 'reps'
          value = record.reps_pr
        } else if (record.volume_pr) {
          type = 'volume'
          value = record.volume_pr
        } else {
          type = 'time'
          value = record.time_pr!
        }

        return {
          id: record.id,
          exerciseName: record.exercise_name,
          type,
          value,
          date: record.pr_date,
          details: record.pr_details
        }
      })

    return NextResponse.json(formattedRecords)

  } catch (error) {
    console.error('Personal records API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Validate required fields
    const { exerciseName, type, value, date, details } = body
    if (!exerciseName || !type || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prepare the record data based on type
    const recordData: any = {
      user_id: userIdDb,
      exercise_name: exerciseName,
      pr_date: date || new Date().toISOString().split('T')[0],
      pr_details: details || {}
    }

    switch (type) {
      case 'weight':
        recordData.weight_pr = value
        break
      case 'reps':
        recordData.reps_pr = value
        break
      case 'volume':
        recordData.volume_pr = value
        break
      case 'time':
        recordData.time_pr = value
        break
      default:
        return NextResponse.json({ error: 'Invalid PR type' }, { status: 400 })
    }

    // Insert the personal record
    const { data: newRecord, error: insertError } = await supabase
      .from('personal_records')
      .insert(recordData)
      .select()
      .single()

    if (insertError) {
      console.error('Insert PR error:', insertError)
      return NextResponse.json({ error: 'Failed to save personal record' }, { status: 500 })
    }

    return NextResponse.json({
      id: newRecord.id,
      exerciseName: newRecord.exercise_name,
      type,
      value,
      date: newRecord.pr_date,
      details: newRecord.pr_details
    })

  } catch (error) {
    console.error('Create personal record API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
