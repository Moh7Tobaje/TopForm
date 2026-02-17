import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/database'
import { supabaseService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { calories, protein, carbs, fat } = await request.json()
    
    // Validate input
    if (!calories && !protein && !carbs && !fat) {
      return NextResponse.json({ error: 'At least one nutritional value is required' }, { status: 400 })
    }

    // Get user ID from database
    const userId = await getOrCreateUser(clerkUserId)
    console.log('Log Meal - User ID:', userId)

    // Insert into nutrition_tracking table
    const insertData = {
      user_id: userId,
      calories_consumed: parseFloat(calories) || 0,
      protein_consumed: parseFloat(protein) || 0,
      carbs_consumed: parseFloat(carbs) || 0,
      fat_consumed: parseFloat(fat) || 0,
      calories_required: 0, // Not setting required values for manual logging
      protein_required: 0,
      carbs_required: 0,
      fat_required: 0,
      timestamp: new Date().toISOString()
    }
    
    console.log('Log Meal - Inserting data:', insertData)
    
    const { data, error } = await supabaseService
      .from('nutrition_tracking')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 })
    }

    console.log('Log Meal - Successfully inserted data:', data)

    // Track activity for streak
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/progress/track-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.headers.get('authorization') || ''}`,
        },
        body: JSON.stringify({
          activityType: 'nutrition'
        })
      })
    } catch (trackError) {
      console.warn('Failed to track activity:', trackError)
      // Don't fail the request if tracking fails
    }

    // Update streak when nutrition is logged
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/progress/streak-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_activity',
          activityType: 'nutrition',
          activityData: {
            calories: parseFloat(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Error updating nutrition streak:', error)
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Meal logged successfully' 
    })

  } catch (error) {
    console.error('Error in log-meal API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
