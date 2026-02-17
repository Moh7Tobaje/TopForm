import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser, getTodayNutritionTotals } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request)
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from database
    const userId = await getOrCreateUser(clerkUserId)
    
    // Get today's nutrition totals from database
    const nutritionTotals = await getTodayNutritionTotals(userId)
    
    return NextResponse.json({
      calories: nutritionTotals.caloriesConsumed,
      requiredCalories: nutritionTotals.caloriesRequired,
      protein: nutritionTotals.proteinConsumed,
      requiredProtein: nutritionTotals.proteinRequired,
      carbs: nutritionTotals.carbsConsumed,
      requiredCarbs: nutritionTotals.carbsRequired,
      fat: nutritionTotals.fatConsumed,
      requiredFat: nutritionTotals.fatRequired,
      source: 'database'
    })
  } catch (error) {
    console.error('Nutrition metrics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}