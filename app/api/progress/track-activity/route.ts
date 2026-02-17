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

    const { activityType, activityDate = new Date().toISOString().split('T')[0] } = body
    if (!activityType) {
      return NextResponse.json({ error: 'Activity type required' }, { status: 400 })
    }

    // Update activity streak using the database function
    const { error: streakError } = await supabase
      .rpc('update_activity_streak', {
        p_user_id: userIdDb,
        activity_date: activityDate
      })

    if (streakError) {
      console.error('Update streak error:', streakError)
      // If function doesn't exist, update manually
      const { data: currentStreak, error: fetchError } = await supabase
        .from('progress_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', userIdDb)
        .single()

      if (!fetchError && currentStreak) {
        const newStreak = activityDate === currentStreak.last_activity_date 
          ? currentStreak.current_streak
          : new Date(activityDate).getTime() === new Date(currentStreak.last_activity_date).getTime() + 24 * 60 * 60 * 1000
          ? currentStreak.current_streak + 1
          : 1

        await supabase
          .from('progress_streaks')
          .update({
            current_streak: newStreak,
            last_activity_date: activityDate,
            longest_streak: Math.max(newStreak, currentStreak.current_streak)
          })
          .eq('user_id', userIdDb)
      } else {
        // Create new streak record
        await supabase
          .from('progress_streaks')
          .insert({
            user_id: userIdDb,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: activityDate
          })
      }
    }

    // Update daily progress summary
    const { data: dailySummary, error: dailyError } = await supabase
      .from('daily_progress_summary')
      .select('*')
      .eq('user_id', userIdDb)
      .eq('summary_date', activityDate)
      .single()

    if (!dailyError && dailySummary) {
      // Update existing daily summary
      const updateData: any = { updated_at: new Date().toISOString() }
      
      if (activityType === 'workout') {
        updateData.workouts_completed = (dailySummary.workouts_completed || 0) + 1
      } else if (activityType === 'nutrition') {
        updateData.nutrition_goal_completed = true
      }

      await supabase
        .from('daily_progress_summary')
        .update(updateData)
        .eq('id', dailySummary.id)
    } else {
      // Create new daily summary
      const initialData: any = {
        user_id: userIdDb,
        summary_date: activityDate
      }

      if (activityType === 'workout') {
        initialData.workouts_completed = 1
      } else if (activityType === 'nutrition') {
        initialData.nutrition_goal_completed = true
      }

      await supabase
        .from('daily_progress_summary')
        .insert(initialData)
    }

    return NextResponse.json({ success: true, message: 'Activity tracked successfully' })

  } catch (error) {
    console.error('Track activity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
