import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// Automated weekly AI insights generation cron job
export async function POST() {
  try {
    const supabase = supabaseService

    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, clerk_user_id, username')
      .eq('is_active', true)

    if (usersError) {
      throw new Error('Failed to fetch users')
    }

    const results = []

    // Generate insights for each user
    for (const user of users || []) {
      try {
        // Call the AI insights generator for each user
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/progress/ai-insights-generator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`
          },
          body: JSON.stringify({
            userId: user.clerk_user_id
          })
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            userId: user.user_id,
            username: user.username,
            success: true,
            insightsGenerated: data.insights?.length || 0
          })
        } else {
          results.push({
            userId: user.user_id,
            username: user.username,
            success: false,
            error: 'Failed to generate insights'
          })
        }
      } catch (error) {
        results.push({
          userId: user.user_id,
          username: user.username,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} users`,
      results,
      summary: {
        totalUsers: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        totalInsights: results.reduce((sum, r) => sum + (r.insightsGenerated || 0), 0)
      }
    })

  } catch (error) {
    console.error('Weekly AI Insights cron error:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
