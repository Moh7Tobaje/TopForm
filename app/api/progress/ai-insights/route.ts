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

    // Fetch AI insights ordered by priority and relevance
    const { data: insights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userIdDb)
      .order('priority_level', { ascending: false })
      .order('relevance_score', { ascending: false })
      .order('generated_at', { ascending: false })
      .limit(10)

    if (insightsError) {
      console.error('AI insights error:', insightsError)
      return NextResponse.json([])
    }

    // Format the response
    const formattedInsights = insights.map((insight: any) => ({
      id: insight.id,
      type: insight.insight_type,
      category: insight.insight_category,
      title: insight.title,
      message: insight.message,
      actionableAdvice: insight.actionable_advice,
      priorityLevel: insight.priority_level,
      generatedAt: insight.generated_at
    }))

    return NextResponse.json(formattedInsights)

  } catch (error) {
    console.error('AI insights API error:', error)
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
    const { type, category, title, message, actionableAdvice, priorityLevel, relevanceScore, basedOnData } = body
    if (!type || !category || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert the AI insight
    const { data: newInsight, error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userIdDb,
        insight_type: type,
        insight_category: category,
        title,
        message,
        actionable_advice: actionableAdvice,
        priority_level: priorityLevel || 3,
        relevance_score: relevanceScore || 0.8,
        based_on_data: basedOnData || {},
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert AI insight error:', insertError)
      return NextResponse.json({ error: 'Failed to save AI insight' }, { status: 500 })
    }

    return NextResponse.json({
      id: newInsight.id,
      type: newInsight.insight_type,
      category: newInsight.insight_category,
      title: newInsight.title,
      message: newInsight.message,
      actionableAdvice: newInsight.actionable_advice,
      priorityLevel: newInsight.priority_level,
      generatedAt: newInsight.generated_at
    })

  } catch (error) {
    console.error('Create AI insight API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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

    const { insightId, isRead, isBookmarked, userFeedback } = body
    if (!insightId) {
      return NextResponse.json({ error: 'Insight ID required' }, { status: 400 })
    }

    // Update the AI insight
    const updateData: any = {}
    if (isRead !== undefined) updateData.is_read = isRead
    if (isBookmarked !== undefined) updateData.is_bookmarked = isBookmarked
    if (userFeedback !== undefined) updateData.user_feedback = userFeedback

    const { data: updatedInsight, error: updateError } = await supabase
      .from('ai_insights')
      .update(updateData)
      .eq('id', insightId)
      .eq('user_id', userIdDb)
      .select()
      .single()

    if (updateError) {
      console.error('Update AI insight error:', updateError)
      return NextResponse.json({ error: 'Failed to update AI insight' }, { status: 500 })
    }

    return NextResponse.json({
      id: updatedInsight.id,
      isRead: updatedInsight.is_read,
      isBookmarked: updatedInsight.is_bookmarked,
      userFeedback: updatedInsight.user_feedback
    })

  } catch (error) {
    console.error('Update AI insight API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
