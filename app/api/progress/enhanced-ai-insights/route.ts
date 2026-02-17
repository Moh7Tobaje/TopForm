import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// Enhanced AI Insights API with GLM Flash integration
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeArabic = searchParams.get('arabic') === 'true'

    // Get user ID
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get insights with metadata
    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('generated_at', { ascending: false })
      .limit(limit)

    // Format insights with Arabic support
    const formattedInsights = (insights || []).map(insight => ({
      id: insight.id,
      type: insight.insight_type,
      category: insight.category,
      title: insight.title,
      message: insight.message,
      actionableAdvice: insight.actionable_advice,
      priorityLevel: insight.priority_level,
      relevanceScore: insight.relevance_score,
      isRead: insight.is_read,
      isBookmarked: insight.is_bookmarked,
      generatedAt: insight.generated_at,
      basedOnData: insight.based_on_data,
      // Arabic translations if available
      arabic: insight.metadata ? {
        title: insight.metadata.title_ar,
        message: insight.metadata.message_ar,
        advice: insight.metadata.advice_ar
      } : null
    }))

    return NextResponse.json({
      success: true,
      insights: formattedInsights,
      count: formattedInsights.length
    })

  } catch (error) {
    console.error('Get AI Insights error:', error)
    return NextResponse.json({ 
      error: 'Failed to get AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update insight (mark as read/bookmarked)
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const body = await request.json()
    const { insightId, isRead, isBookmarked } = body

    if (!insightId) {
      return NextResponse.json({ error: 'Insight ID required' }, { status: 400 })
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update insight
    const updateData: any = {}
    if (typeof isRead === 'boolean') updateData.is_read = isRead
    if (typeof isBookmarked === 'boolean') updateData.is_bookmarked = isBookmarked

    const { data: updatedInsight } = await supabase
      .from('ai_insights')
      .update(updateData)
      .eq('id', insightId)
      .eq('user_id', userData.user_id)
      .select()
      .single()

    if (!updatedInsight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      insight: updatedInsight
    })

  } catch (error) {
    console.error('Update AI Insight error:', error)
    return NextResponse.json({ 
      error: 'Failed to update insight',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
