'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Plus, Minus, Check, X } from 'lucide-react'

interface ProgressTrackerProps {
  onProgressUpdate?: (data: any) => void
}

export function ProgressTracker({ onProgressUpdate }: ProgressTrackerProps) {
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [nutritionTracked, setNutritionTracked] = useState(false)
  const [exercisesCount, setExercisesCount] = useState(0)
  const [setsCount, setSetsCount] = useState(0)
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [loading, setLoading] = useState(false)

  const updateDailyProgress = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/progress/update-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutsCompleted: workoutCompleted ? 1 : 0,
          exercisesCompleted: exercisesCount,
          setsCompleted: setsCount,
          caloriesConsumed: calories,
          proteinConsumed: protein
        })
      })

      if (response.ok) {
        const data = await response.json()
        onProgressUpdate?.(data.data)
        
        // Track activity for streak
        await fetch('/api/progress/track-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityType: workoutCompleted ? 'workout' : 'nutrition'
          })
        })
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      await fetch('/api/progress/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error generating insights:', error)
    }
  }

  useEffect(() => {
    if (workoutCompleted || nutritionTracked) {
      updateDailyProgress()
      generateInsights()
    }
  }, [workoutCompleted, nutritionTracked, exercisesCount, setsCount, calories, protein])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Track Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workout Tracking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Workout Completed</span>
            <Button
              variant={workoutCompleted ? "default" : "outline"}
              size="sm"
              onClick={() => setWorkoutCompleted(!workoutCompleted)}
              className="min-w-[80px]"
            >
              {workoutCompleted ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </>
              ) : (
                'Mark Done'
              )}
            </Button>
          </div>

          {workoutCompleted && (
            <div className="space-y-2 pl-4 border-l-2 border-green-500">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Exercises:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExercisesCount(Math.max(0, exercisesCount - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-white">{exercisesCount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExercisesCount(exercisesCount + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Sets:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSetsCount(Math.max(0, setsCount - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-white">{setsCount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSetsCount(setsCount + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nutrition Tracking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Nutrition Tracked</span>
            <Button
              variant={nutritionTracked ? "default" : "outline"}
              size="sm"
              onClick={() => setNutritionTracked(!nutritionTracked)}
              className="min-w-[80px]"
            >
              {nutritionTracked ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </>
              ) : (
                'Track'
              )}
            </Button>
          </div>

          {nutritionTracked && (
            <div className="space-y-2 pl-4 border-l-2 border-blue-500">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Calories:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalories(Math.max(0, calories - 100))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-12 text-center text-white">{calories}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalories(calories + 100)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Protein (g):</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProtein(Math.max(0, protein - 10))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-12 text-center text-white">{protein}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProtein(protein + 10)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        {(workoutCompleted || nutritionTracked) && (
          <div className="pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Today's Progress</span>
              <Badge variant="secondary" className="text-green-400">
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Workout:</span>
                <span className="ml-2 text-white">
                  {workoutCompleted ? `${exercisesCount} ex, ${setsCount} sets` : 'Not done'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Nutrition:</span>
                <span className="ml-2 text-white">
                  {nutritionTracked ? `${calories} cal, ${protein}g protein` : 'Not tracked'}
                </span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-gray-400">
            Saving progress...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
