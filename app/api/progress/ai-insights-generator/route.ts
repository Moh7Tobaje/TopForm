import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// GLM Flash API configuration
const GLM_FLASH_API = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const GLM_API_KEY = process.env.GLM_FLASH_API_KEY

// Weekly AI Insights Generator using GLM Flash
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService

    // Get user ID from Clerk
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, username')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userIdDb = userData.user_id

    // Get last week's data
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekStr = lastWeek.toISOString().split('T')[0]

    // Fetch comprehensive user data
    const [
      { data: workouts },
      { data: nutrition },
      { data: personalRecords },
      { data: progressStreaks },
      { data: dailyProgress },
      { data: conversations }
    ] = await Promise.all([
      supabase.from('workout_tracking').select('*').eq('user_id', userIdDb).gte('workout_date', lastWeekStr),
      supabase.from('nutrition_tracking').select('*').eq('user_id', userIdDb).gte('timestamp', lastWeek.toISOString()),
      supabase.from('personal_records').select('*').eq('user_id', userIdDb).gte('pr_date', lastWeekStr),
      supabase.from('progress_streaks').select('*').eq('user_id', userIdDb).single(),
      supabase.from('daily_progress_summary').select('*').eq('user_id', userIdDb).gte('date', lastWeekStr),
      supabase.from('conversations').select('*').eq('user_id', userIdDb).limit(5)
    ])

    // Prepare data for GLM Flash analysis
    const weeklyData = {
      user: {
        name: userData.username || 'User',
        currentStreak: progressStreaks?.current_streak || 0,
        longestStreak: progressStreaks?.longest_streak || 0
      },
      workouts: {
        totalSessions: workouts?.length || 0,
        uniqueExercises: workouts ? [...new Set(workouts.map(w => w.exercise_name))].length : 0,
        totalSets: workouts?.reduce((sum, w) => sum + (w.completed_sets || 0), 0) || 0,
        totalReps: workouts?.reduce((sum, w) => sum + (w.completed_reps || 0), 0) || 0,
        workoutDays: workouts ? [...new Set(workouts.map(w => w.workout_date))] : []
      },
      nutrition: {
        totalCalories: nutrition?.reduce((sum, n) => sum + (n.calories_consumed || 0), 0) || 0,
        avgDailyCalories: nutrition?.length > 0 ? Math.round((nutrition?.reduce((sum, n) => sum + (n.calories_consumed || 0), 0) || 0) / 7) : 0,
        totalProtein: nutrition?.reduce((sum, n) => sum + (n.protein_consumed || 0), 0) || 0,
        avgDailyProtein: nutrition?.length > 0 ? Math.round((nutrition?.reduce((sum, n) => sum + (n.protein_consumed || 0), 0) || 0) / 7) : 0,
        trackingDays: nutrition ? [...new Set(nutrition.map(n => new Date(n.timestamp).toISOString().split('T')[0]))].length : 0
      },
      achievements: {
        newPRs: personalRecords?.length || 0,
        avgDayScore: dailyProgress?.length > 0 ? Math.round(dailyProgress.reduce((sum, d) => sum + (d.day_score || 0), 0) / dailyProgress.length) : 0
      },
      conversations: conversations?.length || 0
    }

    // GLM Flash system prompt for fitness analysis
    const systemPrompt = `You are an expert AI fitness coach analyzing weekly progress data. 
Generate 3-5 personalized insights in Arabic and English based on the user's data.

Focus on:
1. Achievements and progress
2. Areas for improvement  
3. Motivational messages
4. Specific recommendations
5. Pattern recognition

Format each insight as:
{
  "type": "achievement|recommendation|motivation|warning",
  "category": "workout|nutrition|consistency|recovery",
  "title_ar": "العنوان بالعربي",
  "title_en": "English Title", 
  "message_ar": "الرسالة بالعربي",
  "message_en": "English message",
  "advice_ar": "النصيحة بالعربي",
  "advice_en": "English advice",
  "priority": 1-5,
  "relevance": 0.0-1.0
}

User Data: ${JSON.stringify(weeklyData, null, 2)}`

    // Call GLM Flash API
    const glmResponse = await fetch(GLM_FLASH_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze this weekly fitness data and generate personalized insights.' }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!glmResponse.ok) {
      throw new Error('GLM Flash API error')
    }

    const glmData = await glmResponse.json()
    const aiResponse = glmData.choices[0].message.content

    // Parse AI response
    let insights = []
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/g)
      if (jsonMatch) {
        insights = jsonMatch.map(json => JSON.parse(json))
      }
    } catch (parseError) {
      console.error('Failed to parse GLM response:', parseError)
      // Fallback insights
      insights = generateFallbackInsights(weeklyData)
    }

    // Save insights to database
    const savedInsights = []
    for (const insight of insights) {
      const { data: savedInsight } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userIdDb,
          insight_type: insight.type,
          category: insight.category,
          title: insight.title_en,
          message: insight.message_en,
          actionable_advice: insight.advice_en,
          priority_level: insight.priority,
          relevance_score: insight.relevance,
          is_read: false,
          is_bookmarked: false,
          generated_at: new Date().toISOString(),
          based_on_data: 'weekly_analysis_glm_flash',
          metadata: {
            title_ar: insight.title_ar,
            message_ar: insight.message_ar,
            advice_ar: insight.advice_ar
          }
        })
        .select()
        .single()

      savedInsights.push(savedInsight)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${savedInsights.length} AI insights using GLM Flash`,
      insights: savedInsights,
      weeklyData
    })

  } catch (error) {
    console.error('Weekly AI Insights generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback insights generation
function generateFallbackInsights(data: any) {
  const insights = []

  // Workout consistency insight
  if (data.workouts.totalSessions >= 3) {
    insights.push({
      type: 'achievement',
      category: 'consistency',
      title_ar: 'انتظام رائع!',
      title_en: 'Great Consistency!',
      message_ar: `لقد تدربت ${data.workouts.totalSessions} مرات هذا الأسبوع!`,
      message_en: `You worked out ${data.workouts.totalSessions} times this week!`,
      advice_ar: 'حافظ على هذا الانتظام لتحقيق أفضل النتائج',
      advice_en: 'Keep this consistency for optimal results',
      priority: 4,
      relevance: 0.9
    })
  }

  // Nutrition tracking insight
  if (data.nutrition.trackingDays >= 5) {
    insights.push({
      type: 'achievement',
      category: 'nutrition',
      title_ar: 'تتبع غذائي ممتاز!',
      title_en: 'Excellent Nutrition Tracking!',
      message_ar: `لقد تابعت تغذيتك ${data.nutrition.trackingDays} أيام هذا الأسبوع`,
      message_en: `You tracked your nutrition for ${data.nutrition.trackingDays} days this week`,
      advice_ar: 'التتبع المنتظم هو مفتاح النجاح',
      advice_en: 'Consistent tracking is the key to success',
      priority: 3,
      relevance: 0.8
    })
  }

  // New PRs insight
  if (data.achievements.newPRs > 0) {
    insights.push({
      type: 'achievement',
      category: 'workout',
      title_ar: 'أرقام شخصية جديدة!',
      title_en: 'New Personal Records!',
      message_ar: `حققت ${data.achievements.newPRs} أرقام شخصية جديدة هذا الأسبوع`,
      message_en: `You achieved ${data.achievements.newPRs} new PRs this week`,
      advice_ar: 'استمر في التقدم والتطور',
      advice_en: 'Keep pushing your limits',
      priority: 5,
      relevance: 0.95
    })
  }

  // Streak insight
  if (data.user.currentStreak >= 7) {
    insights.push({
      type: 'motivation',
      category: 'consistency',
      title_ar: `${data.user.currentStreak} أيام متتالية!`,
      title_en: `${data.user.currentStreak} Day Streak!`,
      message_ar: `لقد حافظت على نشاطك لمدة ${data.user.currentStreak} أيام متتالية`,
      message_en: `You've been active for ${data.user.currentStreak} consecutive days`,
      advice_ar: 'أداء رائع! استمر في بناء العادات',
      advice_en: 'Great job! Keep building those habits',
      priority: 5,
      relevance: 1.0
    })
  }

  return insights
}

// GET endpoint to retrieve recent insights
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user ID
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent insights
    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('generated_at', { ascending: false })
      .limit(limit)

    return NextResponse.json({
      success: true,
      insights: insights || []
    })

  } catch (error) {
    console.error('Get AI Insights error:', error)
    return NextResponse.json({ 
      error: 'Failed to get AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
