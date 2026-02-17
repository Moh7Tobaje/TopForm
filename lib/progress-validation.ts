import { z } from 'zod'

// Progress data validation schemas
export const progressDataSchema = z.object({
  workoutsCompleted: z.number().min(0).max(10),
  exercisesCompleted: z.number().min(0).max(50),
  setsCompleted: z.number().min(0).max(200),
  repsCompleted: z.number().min(0).max(1000),
  caloriesConsumed: z.number().min(0).max(10000),
  proteinConsumed: z.number().min(0).max(500),
  carbsConsumed: z.number().min(0).max(1000),
  fatConsumed: z.number().min(0).max(500)
})

export const workoutDataSchema = z.object({
  workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  exercises: z.array(z.object({
    workoutDayName: z.string().min(1).max(100),
    exerciseName: z.string().min(1).max(100),
    completedSets: z.number().min(0).max(20),
    completedReps: z.number().min(0).max(100),
    completedWeight: z.string().optional(),
    perceivedEffort: z.number().min(1).max(10),
    notes: z.string().max(500).optional()
  })).min(1).max(50)
})

export const nutritionDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  nutritionData: z.array(z.object({
    calories: z.number().min(0).max(5000),
    protein: z.number().min(0).max(200),
    carbs: z.number().min(0).max(500),
    fat: z.number().min(0).max(200),
    caloriesRequired: z.number().min(1000).max(5000).optional(),
    proteinRequired: z.number().min(50).max(300).optional(),
    carbsRequired: z.number().min(100).max(500).optional(),
    fatRequired: z.number().min(20).max(200).optional()
  })).min(1).max(20)
})

export const aiInsightSchema = z.object({
  type: z.enum(['motivation', 'warning', 'achievement', 'recommendation', 'pattern']),
  category: z.enum(['workout', 'nutrition', 'recovery', 'consistency']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionableAdvice: z.string().max(500).optional(),
  priorityLevel: z.number().min(1).max(5),
  relevanceScore: z.number().min(0).max(1)
})

// Data sanitization functions
export function sanitizeProgressData(data: any) {
  return {
    workoutsCompleted: Math.max(0, Math.min(10, Number(data.workoutsCompleted) || 0)),
    exercisesCompleted: Math.max(0, Math.min(50, Number(data.exercisesCompleted) || 0)),
    setsCompleted: Math.max(0, Math.min(200, Number(data.setsCompleted) || 0)),
    repsCompleted: Math.max(0, Math.min(1000, Number(data.repsCompleted) || 0)),
    caloriesConsumed: Math.max(0, Math.min(10000, Number(data.caloriesConsumed) || 0)),
    proteinConsumed: Math.max(0, Math.min(500, Number(data.proteinConsumed) || 0)),
    carbsConsumed: Math.max(0, Math.min(1000, Number(data.carbsConsumed) || 0)),
    fatConsumed: Math.max(0, Math.min(500, Number(data.fatConsumed) || 0))
  }
}

export function sanitizeWorkoutData(data: any) {
  if (!data.exercises || !Array.isArray(data.exercises)) {
    throw new Error('Invalid workout data: exercises array required')
  }

  return {
    workoutDate: data.workoutDate || new Date().toISOString().split('T')[0],
    exercises: data.exercises.map((exercise: any) => ({
      workoutDayName: String(exercise.workoutDayName || 'Workout').slice(0, 100),
      exerciseName: String(exercise.exerciseName || 'Exercise').slice(0, 100),
      completedSets: Math.max(0, Math.min(20, Number(exercise.completedSets) || 0)),
      completedReps: Math.max(0, Math.min(100, Number(exercise.completedReps) || 0)),
      completedWeight: String(exercise.completedWeight || '').slice(0, 20),
      perceivedEffort: Math.max(1, Math.min(10, Number(exercise.perceivedEffort) || 5)),
      notes: String(exercise.notes || '').slice(0, 500)
    }))
  }
}

export function sanitizeNutritionData(data: any) {
  if (!data.nutritionData || !Array.isArray(data.nutritionData)) {
    throw new Error('Invalid nutrition data: nutritionData array required')
  }

  return {
    date: data.date || new Date().toISOString().split('T')[0],
    nutritionData: data.nutritionData.map((meal: any) => ({
      calories: Math.max(0, Math.min(5000, Number(meal.calories) || 0)),
      protein: Math.max(0, Math.min(200, Number(meal.protein) || 0)),
      carbs: Math.max(0, Math.min(500, Number(meal.carbs) || 0)),
      fat: Math.max(0, Math.min(200, Number(meal.fat) || 0)),
      caloriesRequired: Math.max(1000, Math.min(5000, Number(meal.caloriesRequired) || 2000)),
      proteinRequired: Math.max(50, Math.min(300, Number(meal.proteinRequired) || 150)),
      carbsRequired: Math.max(100, Math.min(500, Number(meal.carbsRequired) || 250)),
      fatRequired: Math.max(20, Math.min(200, Number(meal.fatRequired) || 65))
    }))
  }
}

// Security validation functions
export function validateUserAccess(userId: string, targetUserId: string): boolean {
  return userId === targetUserId
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, maxLength)
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false
  
  // Check if range is reasonable (not too far in the past/future)
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  
  return start >= oneYearAgo && end <= oneYearFromNow && start <= end
}

// Rate limiting validation
export function checkRateLimit(userId: string, action: string, limit: number = 100): boolean {
  // This would typically use Redis or similar for distributed rate limiting
  // For now, we'll implement a simple in-memory check
  const key = `${userId}:${action}`
  // Implementation would go here
  return true
}

// Data integrity checks
export function validateProgressIntegrity(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for logical inconsistencies
  if (data.todayWorkouts > 0 && data.todayExercises === 0) {
    errors.push('Workouts logged but no exercises recorded')
  }
  
  if (data.todaySets > 0 && data.todayExercises === 0) {
    errors.push('Sets logged but no exercises recorded')
  }
  
  if (data.todayCalories > 0 && data.todayProtein === 0) {
    errors.push('Calories logged but no protein recorded')
  }
  
  // Check for unrealistic values
  if (data.todayScore > 100) {
    errors.push('Day score exceeds maximum')
  }
  
  if (data.currentStreak > 365) {
    errors.push('Streak duration seems unrealistic')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// SQL injection prevention
export function sanitizeSqlInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/['"\\;]/g, '')
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeSqlInput)
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeSqlInput(key)] = sanitizeSqlInput(value)
    }
    return sanitized
  }
  return input
}
