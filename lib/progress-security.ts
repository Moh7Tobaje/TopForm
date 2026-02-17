import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  progressDataSchema, 
  workoutDataSchema, 
  nutritionDataSchema,
  sanitizeProgressData,
  sanitizeWorkoutData,
  sanitizeNutritionData,
  validateUserAccess,
  validateProgressIntegrity,
  checkRateLimit,
  sanitizeSqlInput
} from '@/lib/progress-validation'

// Middleware for progress API security
export async function validateProgressRequest(request: NextRequest, syncType?: string) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return { error: 'Unauthorized', status: 401 }
    }

    // Check rate limiting
    if (!checkRateLimit(userId, syncType || 'progress', 100)) {
      return { error: 'Rate limit exceeded', status: 429 }
    }

    return { userId, valid: true }
  } catch (error) {
    console.error('Auth validation error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

// Validate and sanitize progress data
export function validateProgressData(data: any) {
  try {
    // Sanitize data
    const sanitizedData = sanitizeProgressData(data)
    
    // Validate with schema
    const validatedData = progressDataSchema.parse(sanitizedData)
    
    // Check integrity
    const integrityCheck = validateProgressIntegrity({
      todayWorkouts: validatedData.workoutsCompleted,
      todayExercises: validatedData.exercisesCompleted,
      todaySets: validatedData.setsCompleted,
      todayCalories: validatedData.caloriesConsumed,
      todayProtein: validatedData.proteinConsumed,
      todayScore: 0 // Would be calculated
    })
    
    if (!integrityCheck.isValid) {
      return { 
        error: 'Data integrity check failed', 
        details: integrityCheck.errors,
        status: 400 
      }
    }
    
    return { data: validatedData, valid: true }
  } catch (error) {
    console.error('Progress data validation error:', error)
    return { error: 'Invalid progress data', status: 400 }
  }
}

// Validate and sanitize workout data
export function validateWorkoutData(data: any) {
  try {
    // Sanitize data
    const sanitizedData = sanitizeWorkoutData(data)
    
    // Validate with schema
    const validatedData = workoutDataSchema.parse(sanitizedData)
    
    // Additional business logic validation
    const totalSets = validatedData.exercises.reduce((sum, ex) => sum + ex.completedSets, 0)
    const totalReps = validatedData.exercises.reduce((sum, ex) => sum + ex.completedReps, 0)
    
    if (totalSets > 200 || totalReps > 1000) {
      return { 
        error: 'Workout volume exceeds reasonable limits', 
        status: 400 
      }
    }
    
    return { data: validatedData, valid: true }
  } catch (error) {
    console.error('Workout data validation error:', error)
    return { error: 'Invalid workout data', status: 400 }
  }
}

// Validate and sanitize nutrition data
export function validateNutritionData(data: any) {
  try {
    // Sanitize data
    const sanitizedData = sanitizeNutritionData(data)
    
    // Validate with schema
    const validatedData = nutritionDataSchema.parse(sanitizedData)
    
    // Additional business logic validation
    const totalCalories = validatedData.nutritionData.reduce((sum, meal) => sum + meal.calories, 0)
    const totalProtein = validatedData.nutritionData.reduce((sum, meal) => sum + meal.protein, 0)
    
    if (totalCalories > 15000 || totalProtein > 500) {
      return { 
        error: 'Nutrition values exceed reasonable limits', 
        status: 400 
      }
    }
    
    return { data: validatedData, valid: true }
  } catch (error) {
    console.error('Nutrition data validation error:', error)
    return { error: 'Invalid nutrition data', status: 400 }
  }
}

// Security headers for API responses
export function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

// Input sanitization for database queries
export function sanitizeDbInput(input: any) {
  return sanitizeSqlInput(input)
}

// Error response helper
export function createErrorResponse(error: string, status: number = 500, details?: any) {
  const response = NextResponse.json(
    { 
      error, 
      timestamp: new Date().toISOString(),
      ...(details && { details })
    },
    { status }
  )
  return setSecurityHeaders(response)
}

// Success response helper
export function createSuccessResponse(data: any, status: number = 200) {
  const response = NextResponse.json({
    ...data,
    timestamp: new Date().toISOString()
  }, { status })
  return setSecurityHeaders(response)
}
