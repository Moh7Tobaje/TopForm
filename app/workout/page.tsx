"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Loader2, RefreshCw, Calendar, Camera, Video, Upload, X, Square, Database, TrendingUp, Plus, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string | number
  rest: number
  completed: boolean
}

interface WorkoutDay {
  dayName: string
  summary: string
  exercises: Array<{
    name: string
    sets: number
    reps: number | string
    rest?: number
  }>
}

interface WorkoutSchedule {
  numberOfDays: number
  days: WorkoutDay[]
}

export default function WorkoutPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { t } = useLanguage()
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  // State for tracking completed sets
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, { rows: { weight: string; reps: string; actualWeight: string; notes: string }[] }>>({})
  const [sending, setSending] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')
  
  // State for editable workout data (mock data)
  const [editableWorkoutData, setEditableWorkoutData] = useState<Record<string, any>>({})
  
  // State for workout summary modal
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState<Record<string, string>>({})
  const [sendingToCoach, setSendingToCoach] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  
  // State for real workout data from database
  const [realWorkoutData, setRealWorkoutData] = useState<Record<string, any>>({})
  
  // Mock workout data for demonstration (will be replaced by real data)
  const [mockWorkoutData] = useState({
    Monday: {
      workout_day_name: 'Monday',
      exercises: [
        {
          id: 'ex1',
          exercise_name: 'Dumbbell Squat',
          required_sets: 4,
          required_reps: 12,
          required_weight: 20,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 60,
          actual_rest_time: 0
        },
        {
          id: 'ex2',
          exercise_name: 'Bench Press',
          required_sets: 3,
          required_reps: 10,
          required_weight: 40,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 90,
          actual_rest_time: 0
        }
      ],
      total_sets: 7,
      total_reps: 78,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Tuesday: {
      workout_day_name: 'Tuesday',
      exercises: [
        {
          id: 'ex3',
          exercise_name: 'Deadlift',
          required_sets: 4,
          required_reps: 8,
          required_weight: 60,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 120,
          actual_rest_time: 0
        },
        {
          id: 'ex4',
          exercise_name: 'Pull-ups',
          required_sets: 3,
          required_reps: 15,
          required_weight: 0,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 60,
          actual_rest_time: 0
        }
      ],
      total_sets: 7,
      total_reps: 77,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Wednesday: {
      workout_day_name: 'Wednesday',
      exercises: [
        {
          id: 'ex5',
          exercise_name: 'Shoulder Press',
          required_sets: 3,
          required_reps: 12,
          required_weight: 25,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 60,
          actual_rest_time: 0
        }
      ],
      total_sets: 3,
      total_reps: 36,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Thursday: {
      workout_day_name: 'Thursday',
      exercises: [
        {
          id: 'ex6',
          exercise_name: 'Leg Press',
          required_sets: 4,
          required_reps: 15,
          required_weight: 80,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 90,
          actual_rest_time: 0
        }
      ],
      total_sets: 4,
      total_reps: 60,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Friday: {
      workout_day_name: 'Friday',
      exercises: [
        {
          id: 'ex7',
          exercise_name: 'Bicep Curls',
          required_sets: 3,
          required_reps: 12,
          required_weight: 15,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 45,
          actual_rest_time: 0
        },
        {
          id: 'ex8',
          exercise_name: 'Tricep Dips',
          required_sets: 3,
          required_reps: 10,
          required_weight: 0,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 60,
          actual_rest_time: 0
        }
      ],
      total_sets: 6,
      total_reps: 66,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Saturday: {
      workout_day_name: 'Saturday',
      exercises: [
        {
          id: 'ex9',
          exercise_name: 'Cardio - Running',
          required_sets: 1,
          required_reps: 30,
          required_weight: 0,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: null,
          suggested_rest_time: 0,
          actual_rest_time: 0
        }
      ],
      total_sets: 1,
      total_reps: 30,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    },
    Sunday: {
      workout_day_name: 'Sunday',
      exercises: [],
      total_sets: 0,
      total_reps: 0,
      completed_sets: 0,
      completed_reps: 0,
      latest_date: new Date().toISOString()
    }
  })

  // Analyze performance (video) modal
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState<'picker' | 'record' | 'analyzing' | 'result' | 'error'>('picker')
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Save weight unit to localStorage and load it on component mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('weightUnit') as 'kg' | 'lb' | null
    if (savedUnit) {
      setWeightUnit(savedUnit)
    }
  }, [])
  
  // Update localStorage when weightUnit changes
  useEffect(() => {
    localStorage.setItem('weightUnit', weightUnit)
  }, [weightUnit])

  // Set selected day to first available day on component mount
  useEffect(() => {
    const availableDays = getAvailableWorkoutDays()
    if (availableDays.length > 0) {
      setSelectedDay(availableDays[0])
    } else {
      // Don't set any day if no real data available
      setSelectedDay('')
    }
  }, [realWorkoutData])

  // Get all available workout days (from real database data only)
  const getAvailableWorkoutDays = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    // Get days from real database data only
    const realDays = Object.keys(realWorkoutData).filter(day => {
      const dayData = realWorkoutData[day]
      return dayData && dayData.exercises && dayData.exercises.length > 0
    })
    
    // Sort days in proper order
    const sortedRealDays = realDays.sort((a, b) => {
      // Handle custom day names like "Day 1: Chest"
      const aIsCustom = !daysOfWeek.includes(a)
      const bIsCustom = !daysOfWeek.includes(b)
      
      if (aIsCustom && bIsCustom) {
        return a.localeCompare(b)
      }
      if (aIsCustom) return 1
      if (bIsCustom) return -1
      
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
    })
    
    return sortedRealDays
  }

  // Get workout data for selected day (real database data only)
  const getSelectedDayData = () => {
    // Only use real database data - no fallback to mock data
    return realWorkoutData[selectedDay] || null
  }

  // Convert weight function
  const convertWeight = (weight: number | null) => {
    if (weight === null) return ''
    if (weightUnit === 'lb') {
      return `${Math.round(weight * 2.20462)}`
    }
    return `${weight}`
  }

  // Handle input changes for editable workout data
  const handleWorkoutInputChange = (exerciseId: string, setIndex: number, field: string, value: string) => {
    setEditableWorkoutData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [`${setIndex}_${field}`]: value
      }
    }))
  }

  // Toggle set completion
  const toggleSetCompletion = (exerciseId: string, setIndex: number) => {
    const setKey = `${exerciseId}_${setIndex}`
    setCompletedSets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(setKey)) {
        newSet.delete(setKey)
      } else {
        newSet.add(setKey)
      }
      return newSet
    })
  }

  // Handle workout notes change
  const handleWorkoutNoteChange = (exerciseId: string, setIndex: number, note: string) => {
    const noteKey = `${exerciseId}_${setIndex}`
    setWorkoutNotes(prev => ({
      ...prev,
      [noteKey]: note
    }))
  }

  // Update all workout-related database tables
  const updateWorkoutTables = async (dayData: any, currentDate: string) => {
    if (!user) return
    
    try {
      // 1. Update workout_tracking table with completed sets and notes
      for (const exercise of dayData.exercises) {
        for (let setIndex = 0; setIndex < exercise.required_sets; setIndex++) {
          const setKey = `${exercise.id}_${setIndex}`
          const isCompleted = completedSets.has(setKey)
          const note = workoutNotes[setKey] || ''
          const actualWeight = editableWorkoutData[setKey]?.weight || exercise.required_weight
          const actualReps = editableWorkoutData[setKey]?.reps || exercise.required_reps
          
          if (isCompleted) {
            // Try to update workout_tracking
            try {
              await fetch('/api/workout/tracking', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  workout_day_name: dayData.workout_day_name,
                  exercise_name: exercise.exercise_name,
                  completed_sets: 1,
                  completed_reps: parseInt(actualReps) || exercise.required_reps,
                  completed_weight: actualWeight || exercise.required_weight,
                  actual_rest_time: exercise.suggested_rest_time || 60,
                  perceived_effort: 7, // Default effort
                  form_quality: 4, // Default form quality
                  notes: note
                })
              })
            } catch (error) {
              console.warn('Failed to update workout_tracking:', error)
            }
          }
        }
      }
      
      // 2. Update workout_sessions table
      const totalSets = dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)
      const completedCount = Array.from({ length: totalSets })
        .filter((_, setIndex) => {
          return dayData.exercises.some((ex: any) => completedSets.has(`${ex.id}_${setIndex}`))
        }).length
      
      try {
        await fetch('/api/workout/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_date: new Date().toISOString().split('T')[0],
            workout_day_name: dayData.workout_day_name,
            total_exercises: dayData.exercises.length,
            total_sets_planned: totalSets,
            total_sets_completed: completedCount,
            total_reps_planned: dayData.exercises.reduce((sum: number, ex: any) => sum + (ex.required_reps * ex.required_sets), 0),
            total_reps_completed: completedCount * 10, // Average 10 reps per completed set
            session_duration: 45, // Default 45 minutes
            average_rest_time: dayData.exercises.reduce((sum: number, ex: any) => sum + (ex.suggested_rest_time || 60), 0) / dayData.exercises.length,
            perceived_difficulty: completedCount === totalSets ? 8 : 6,
            status: completedCount === totalSets ? 'completed' : 'in_progress',
            session_notes: `Workout completed with ${completedCount}/${totalSets} sets. ${Object.values(workoutNotes).filter(note => note).length} notes added.`,
            ai_feedback: 'Pending AI coach analysis...'
          })
        })
      } catch (error) {
        console.warn('Failed to update workout_sessions:', error)
      }
      
      // 3. Update exercise_performance table for completed sets
      for (const exercise of dayData.exercises) {
        const completedSetsForExercise = Array.from({ length: exercise.required_sets })
          .filter((_, setIndex) => completedSets.has(`${exercise.id}_${setIndex}`))
        
        if (completedSetsForExercise.length > 0) {
          const totalWeight = completedSetsForExercise.reduce((sum: number, setIndex) => {
            const setKey = `${exercise.id}_${setIndex}`
            const weight = parseFloat(editableWorkoutData[setKey]?.weight || exercise.required_weight || '0')
            const reps = parseInt(editableWorkoutData[setKey]?.reps || exercise.required_reps || '0')
            return sum + (weight * reps)
          }, 0)
          
          const avgWeight = completedSetsForExercise.reduce((sum: number, setIndex) => {
            const setKey = `${exercise.id}_${setIndex}`
            return sum + parseFloat(editableWorkoutData[setKey]?.weight || exercise.required_weight || '0')
          }, 0) / completedSetsForExercise.length
          
          const maxReps = Math.max(...completedSetsForExercise.map(setIndex => {
            const setKey = `${exercise.id}_${setIndex}`
            return parseInt(editableWorkoutData[setKey]?.reps || exercise.required_reps || '0')
          }))
          
          // Calculate estimated 1RM using Epley formula
          const estimated1RM = avgWeight * (1 + maxReps / 30)
          
          try {
            await fetch('/api/exercise/performance', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                exercise_name: exercise.exercise_name,
                weight_used: `${avgWeight}${weightUnit}`,
                reps_completed: maxReps,
                sets_completed: completedSetsForExercise.length,
                one_rep_max_estimated: estimated1RM,
                volume_total: Math.round(totalWeight),
                personal_record: false, // Will be updated by database trigger
                progression_type: 'strength'
              })
            })
          } catch (error) {
            console.warn('Failed to update exercise_performance:', error)
          }
        }
      }
      
      console.log('✅ Workout tables update completed (some updates may have failed)')
      
    } catch (error) {
      console.error('❌ Error updating workout tables:', error)
      // Don't throw error to allow chat to still work
    }
  }

  // Send workout data to AI coach
  const sendWorkoutToCoach = async () => {
    if (!user || !selectedDay || !realWorkoutData[selectedDay]) return
    
    setSendingToCoach(true)
    
    try {
      const dayData = realWorkoutData[selectedDay]
      const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      // Build comprehensive workout message
      let workoutMessage = `🏋️‍♂️ **WORKOUT SESSION SUMMARY** 🏋️‍♂️\n\n`
      workoutMessage += `📅 **Date:** ${currentDate}\n`
      workoutMessage += `💪 **Workout Day:** ${dayData.workout_day_name}\n`
      workoutMessage += `🔥 **Total Exercises:** ${dayData.exercises.length}\n`
      workoutMessage += `📊 **Total Sets:** ${dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)}\n\n`
      
      workoutMessage += `---\n\n`
      
      // Add each exercise with details
      dayData.exercises.forEach((exercise: any, exerciseIndex: number) => {
        workoutMessage += `## ${exerciseIndex + 1}. ${exercise.exercise_name}\n`
        workoutMessage += `📋 **Planned:** ${exercise.required_sets} sets × ${exercise.required_reps} reps`
        if (exercise.required_weight) {
          workoutMessage += ` • ${exercise.required_weight}`
        }
        if (exercise.suggested_rest_time) {
          workoutMessage += ` • ${exercise.suggested_rest_time}s rest`
        }
        workoutMessage += `\n\n`
        
        // Add each set with completion status and notes
        for (let setIndex = 0; setIndex < exercise.required_sets; setIndex++) {
          const setKey = `${exercise.id}_${setIndex}`
          const isCompleted = completedSets.has(setKey)
          const note = workoutNotes[setKey] || 'No notes'
          
          workoutMessage += `  **Set ${setIndex + 1}:** ${isCompleted ? '✅ COMPLETED' : '❌ NOT COMPLETED'}\n`
          
          // Get actual data if available
          const actualWeight = editableWorkoutData[setKey]?.weight || exercise.required_weight
          const actualReps = editableWorkoutData[setKey]?.reps || exercise.required_reps
          
          if (isCompleted && (actualWeight || actualReps)) {
            workoutMessage += `  🏋️ **Actual:** ${actualWeight || 'N/A'} × ${actualReps || 'N/A'} reps\n`
          }
          
          workoutMessage += `  📝 **Notes:** ${note}\n\n`
        }
        
        workoutMessage += `---\n\n`
      })
      
      // Add completion summary
      const totalSets = dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)
      const completedCount = Array.from({ length: totalSets })
        .filter((_, setIndex) => {
          return dayData.exercises.some((ex: any) => completedSets.has(`${ex.id}_${setIndex}`))
        }).length
      
      workoutMessage += `📈 **SESSION SUMMARY:**\n`
      workoutMessage += `✅ **Completed Sets:** ${completedCount}/${totalSets} (${Math.round((completedCount / totalSets) * 100)}%)\n`
      workoutMessage += `🎯 **Performance:** ${completedCount === totalSets ? 'PERFECT WORKOUT! 💪' : 'Good effort! Keep pushing! 🔥'}\n\n`
      
      workoutMessage += `---\n\n`
      workoutMessage += `🤖 **AI Coach Analysis Request:**\n`
      workoutMessage += `Please analyze my workout performance and provide feedback on:\n`
      workoutMessage += `1. Form and technique improvements\n`
      workoutMessage += `2. Progress recommendations\n`
      workoutMessage += `3. Next workout suggestions\n`
      workoutMessage += `4. Any adjustments needed based on my performance\n\n`
      workoutMessage += `Thank you! 🙏`
      
      // Update all database tables before sending to chat
      await updateWorkoutTables(dayData, currentDate)
      
      // Track activity for streak if workout was completed
      if (completedCount > 0) {
        try {
          await fetch('/api/progress/track-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityType: 'workout' })
          })
        } catch (trackError) {
          console.warn('Failed to track workout activity:', trackError)
        }
      }
      
      // Send to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: workoutMessage
        })
      })
      
      if (response.ok) {
        // Redirect to chat page
        router.push('/chat')
      } else {
        throw new Error('Failed to send workout data')
      }
      
    } catch (error) {
      console.error('Error sending workout to coach:', error)
      alert('Failed to send workout data. Please try again.')
    } finally {
      setSendingToCoach(false)
    }
  }

  // Save workout data to database
  const saveWorkoutData = async (exercise: any, exerciseIndex: number) => {
    if (!user) return
    
    try {
      const exerciseData = exerciseInputs[exercise.id]?.rows || []
      const completedSets = exerciseData.filter(row => row.weight && row.reps).length
      const totalReps = exerciseData.reduce((sum, row) => sum + (parseInt(row.reps) || 0), 0)
      const avgWeight = exerciseData.length > 0 
        ? exerciseData.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0) / exerciseData.length 
        : 0
      
      const payload = {
        workout_day_name: selectedDay,
        exercise_name: exercise.exercise_name,
        completed_sets: completedSets,
        completed_reps: totalReps,
        completed_weight: avgWeight > 0 ? `${avgWeight}${weightUnit}` : '',
        actual_rest_time: exercise.suggested_rest_time || 60,
        perceived_effort: 7, // Default effort
        form_quality: 4, // Default form quality
        notes: exerciseData.map(row => row.notes).filter(Boolean).join('; ')
      }
      
      const response = await fetch('/api/workout/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Workout data saved:', result)
        
        // Refresh data
        fetchWorkoutTracking()
        
        // Show success message
        alert('Progress saved successfully!')
      } else {
        throw new Error('Failed to save workout data')
      }
    } catch (err) {
      console.error('Error saving workout data:', err)
      alert('Failed to save progress. Please try again.')
    }
  }

  // Get set type label
  const getSetTypeLabel = (setIndex: number, totalSets: number) => {
    if (setIndex === 0) return 'W' // Warmup
    if (setIndex === totalSets - 1) return 'F' // Failure
    return '' // Regular set
  }




  // Fetch workout tracking data from API
  const fetchWorkoutTracking = async (date?: string, workoutDay?: string) => {
    if (!isLoaded || !user) {
      return []
    }

    try {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (workoutDay) params.append('workoutDay', workoutDay)
      
      const response = await fetch(`/api/workout/tracking?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch workout tracking')
      }

      const data = await response.json()
      return data.data || []
    } catch (err) {
      console.error('Error fetching workout tracking:', err)
      return []
    }
  }

  // Fetch workout schedule from API
  const fetchWorkoutSchedule = async () => {
    if (!isLoaded || !user) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(true)
      
      // Fetch ALL workout tracking data (not just today's)
      const trackingData = await fetchWorkoutTracking() // Remove date parameter to get all data
      
      // Group tracking data by workout day
      const workoutDataMap = trackingData.reduce((acc: Record<string, any>, item: any) => {
        const dayName = item.workout_day_name
        if (!acc[dayName]) {
          acc[dayName] = {
            workout_day_name: dayName,
            exercises: [],
            total_sets: 0,
            total_reps: 0,
            completed_sets: 0,
            completed_reps: 0,
            latest_date: item.workout_date
          }
        }
        
        acc[dayName].exercises.push({
          id: `tracked-${item.id}`,
          exercise_name: item.exercise_name,
          required_sets: item.required_sets,
          required_reps: item.required_reps,
          required_weight: item.required_weight,
          completed_sets: item.completed_sets,
          completed_reps: item.completed_reps,
          completed_weight: item.completed_weight,
          suggested_rest_time: item.suggested_rest_time,
          actual_rest_time: item.actual_rest_time,
          perceived_effort: item.perceived_effort,
          form_quality: item.form_quality,
          notes: item.notes
        })
        
        acc[dayName].total_sets += item.required_sets || 0
        acc[dayName].total_reps += item.required_reps || 0
        acc[dayName].completed_sets += item.completed_sets || 0
        acc[dayName].completed_reps += item.completed_reps || 0
        
        return acc
      }, {} as Record<string, any>)
      
      // Update real workout data with database data
      setRealWorkoutData(workoutDataMap)
      console.log('Real workout data loaded:', Object.keys(workoutDataMap))
      
      // Also try to get schedule from chat-based extraction
      const scheduleResponse = await fetch('/api/workout/schedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json()
        if (scheduleData.schedule) {
          setWorkoutSchedule(scheduleData.schedule)
          setError(null)
        }
      }
      
    } catch (err) {
      console.error('Error fetching workout data:', err)
      setError('Failed to load workout data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWorkoutSchedule()
  }, [isLoaded, user])

  // Also fetch data when realWorkoutData dependencies change
  useEffect(() => {
    if (isLoaded && user && Object.keys(realWorkoutData).length === 0) {
      fetchWorkoutSchedule()
    }
  }, [isLoaded, user, realWorkoutData])

  // Convert workout schedule to exercises format
  const getExercisesForDay = (dayIndex: number): Exercise[] => {
    if (!workoutSchedule || !workoutSchedule.days || dayIndex >= workoutSchedule.days.length) {
      return []
    }

    const day = workoutSchedule.days[dayIndex]
    return day.exercises.map((ex, index) => ({
      id: `day-${dayIndex}-ex-${index}`,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest || 60, // Default 60 seconds rest
      completed: completedExercises.has(`day-${dayIndex}-ex-${index}`)
    }))
  }

  // Initialize inputs for the selected day based on number of sets and saved data
  useEffect(() => {
    if (!workoutSchedule) return
    const dayExercises = getExercisesForDay(selectedDayIndex)
    
    setExerciseInputs(prev => {
      const updated = { ...prev }
      dayExercises.forEach(ex => {
        const existing = updated[ex.id]
        const desiredLength = ex.sets
        
        if (!existing || !existing.rows || existing.rows.length !== desiredLength) {
          // Initialize with empty rows
          const rows = Array.from({ length: desiredLength }, () => ({ weight: "", reps: "", actualWeight: "", notes: "" }))
          
          updated[ex.id] = { rows }
        }
      })
      return updated
    })
  }, [workoutSchedule, selectedDayIndex])

  const handleInputChange = (exerciseId: string, rowIndex: number, field: 'weight' | 'reps' | 'actualWeight' | 'notes', value: string) => {
    setExerciseInputs(prev => {
      const current = prev[exerciseId]?.rows ?? []
      const rows = current.length > 0 ? [...current] : [...Array(rowIndex + 1)].map(() => ({ weight: "", reps: "", actualWeight: "", notes: "" }))
      rows[rowIndex] = { ...rows[rowIndex], [field]: value }
      return { ...prev, [exerciseId]: { rows } }
    })
  }

  const handleStartExercise = (exerciseId: string) => {
    // Mark exercise as completed
    setCompletedExercises(prev => new Set(prev).add(exerciseId))
    console.log("Starting exercise:", exerciseId)
  }

  const handleSwapExercise = (exerciseId: string) => {
    // Handle swap exercise logic
    console.log("Swapping exercise:", exerciseId)
  }

  const handleToggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
  }

  const openAnalyze = () => {
    setAnalyzeOpen(true)
    setAnalyzeStep('picker')
    setAnalyzeError(null)
    setAnalysisResult(null)
  }

  const closeAnalyze = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    recordedChunksRef.current = []
    setAnalyzeOpen(false)
    setAnalyzeStep('picker')
    setAnalyzeError(null)
    setAnalysisResult(null)
    setIsRecording(false)
    setVideoUrlInput('')
  }

  const startRecordFlow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        videoRef.current.playsInline = true
        videoRef.current.play().catch(() => {})
      }
      setAnalyzeStep('record')
      setAnalyzeError(null)
    } catch (e) {
      setAnalyzeError('Camera access denied or not available. Please allow camera and try again.')
      setAnalyzeStep('error')
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return
    recordedChunksRef.current = []
    const opts = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? { mimeType: 'video/webm;codecs=vp9' } : {}
    const mr = new MediaRecorder(streamRef.current, opts)
    mediaRecorderRef.current = mr
    mr.ondataavailable = (e) => { if (e.data.size) recordedChunksRef.current.push(e.data) }
    mr.start(500)
    setIsRecording(true)
  }

  const stopRecording = () => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') return
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'recording.webm', { type: 'video/webm' })
      sendVideo(file)
    }
    mr.stop()
    setIsRecording(false)
  }

  const chooseFromGallery = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f && f.type.startsWith('video/')) {
      sendVideo(f)
    } else if (f) {
      setAnalyzeError('Please select a video file.')
      setAnalyzeStep('error')
    }
  }

  const sendVideo = async (file: File) => {
    setAnalyzeStep('analyzing')
    setAnalyzeError(null)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    try {
      const fd = new FormData()
      fd.append('video', file, file.name)
      const res = await fetch('/api/workout/analyze-video', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setAnalyzeError(data.error || data.details || 'Analysis failed.')
        setAnalyzeStep('error')
        return
      }
      setAnalysisResult(data.analysis || 'No analysis returned.')
      setAnalyzeStep('result')
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Network error. Try again.')
      setAnalyzeStep('error')
    }
  }

  const sendVideoUrl = async (url: string) => {
    const u = url.trim()
    if (!/^https?:\/\/.+\..+/.test(u)) {
      setAnalyzeError('Enter a valid URL (e.g. https://…).')
      setAnalyzeStep('error')
      return
    }
    setAnalyzeStep('analyzing')
    setAnalyzeError(null)
    try {
      const fd = new FormData()
      fd.append('video_url', u)
      const res = await fetch('/api/workout/analyze-video', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setAnalyzeError(data.error || data.details || 'Analysis failed.')
        setAnalyzeStep('error')
        return
      }
      setAnalysisResult(data.analysis || 'No analysis returned.')
      setAnalyzeStep('result')
      setVideoUrlInput('')
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Network error. Try again.')
      setAnalyzeStep('error')
    }
  }

  const sendDaySubmission = async (dayIndex: number) => {
    if (!workoutSchedule) return
    setSending(true)
    try {
      // Database save functionality removed
      
      const day = workoutSchedule.days[dayIndex]
      const exercises = getExercisesForDay(dayIndex)
      
      // Build a structured summary message
      let message = `Workout Log for ${day.dayName} (${day.summary})\n\n`
      message += `Weight Unit: ${weightUnit}\n\n`
      
      for (const ex of exercises) {
        message += `Exercise: ${ex.name} — ${ex.sets} set(s)\n`
        const rows = exerciseInputs[ex.id]?.rows || []
        for (let i = 0; i < ex.sets; i++) {
          const row = rows[i] || { weight: "", reps: "", actualWeight: "", notes: "" }
          const weight = row.weight ? `${row.weight} ${weightUnit}` : "N/A"
          const actualWeight = row.actualWeight ? `${row.actualWeight}` : "N/A"
          const reps = row.reps ? `${row.reps}` : "N/A"
          const notes = row.notes ? `${row.notes}` : ""
          message += `  Set ${i + 1}: Weight = ${weight}, Actual Weight = ${actualWeight}, Reps = ${reps}${notes ? `, Notes = ${notes}` : ""}\n`
        }
        message += "\n"
      }
      message += "Please analyze this workout log, provide feedback, and update my training plan as needed."

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          metadata: {
            weightUnit: weightUnit,
            type: 'workout_log'
          }
        })
      })

      if (!res.ok) {
        console.error('Failed to send workout log')
      } else {
        // Navigate to chat to show the submitted message and model response
        router.push('/chat')
      }
    } catch (e) {
      console.error('Error sending workout log:', e)
    } finally {
      setSending(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#091110] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e3372e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091110] relative overflow-hidden">
      {/* Speckled background effect - starry night texture */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0.5px, transparent 0.5px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '15px 15px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t('workout.title')}
              </h1>
              <Button
                onClick={() => {
                  fetchWorkoutSchedule()
                }}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#e3372e]/20"
                disabled={refreshing}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {loading ? (
              <p className="text-gray-300 text-base md:text-lg">{t('workout.loading')}</p>
            ) : error ? (
              <p className="text-yellow-400 text-base md:text-lg">{error}</p>
            ) : Object.keys(realWorkoutData).length > 0 ? (
              <p className="text-gray-300 text-base md:text-lg">
                {t('workout.programInfo', { days: workoutSchedule?.numberOfDays || Object.keys(realWorkoutData).length })}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lb' : 'kg')}
              variant="outline"
              className="bg-black text-white border-gray-700 hover:bg-gray-900 rounded-lg"
            >
              {weightUnit.toUpperCase()}
            </Button>
            <Link href="/">
              <Button 
                variant="outline" 
                className="bg-black text-white border-gray-700 hover:bg-gray-900 rounded-lg hidden md:flex"
              >
                {t('workout.backToHome')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Analyze Form - Featured CTA */}
        <button
          type="button"
          onClick={openAnalyze}
          className="group relative w-full max-w-2xl mx-auto flex items-center justify-center gap-4 py-5 px-8 mb-6 md:mb-8 rounded-2xl overflow-hidden
            bg-gradient-to-r from-[#e3372e] via-[#c41e3a] to-[#a01830]
            border-2 border-white/20
            shadow-[0_0_30px_rgba(227,55,46,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
            hover:shadow-[0_0_40px_rgba(227,55,46,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:scale-[1.02] hover:border-white/30
            active:scale-[0.99]
            transition-all duration-300 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e3372e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091110]"
        >
          <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" aria-hidden />
          <span className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm
            group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300">
            <Camera className="w-7 h-7 text-white" strokeWidth={2.5} />
          </span>
          <span className="relative text-white font-bold text-xl md:text-2xl tracking-tight drop-shadow-sm">
            {t('workout.analyzePerformance')}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Choose video"
        />

        {/* Day Navigation Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#e3372e]" />
            <h2 className="text-xl font-bold text-white">{t('workout.selectDay')}</h2>
          </div>
          
          {/* {getAvailableWorkoutDays().length === 0 && !loading ? (
            <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Workout Data Found</h3>
              <p className="text-gray-400 mb-4">
                Start a conversation with your AI coach about workouts to see your training data here.
              </p>
              <Button 
                onClick={fetchWorkoutSchedule}
                className="bg-[#e3372e] text-white hover:bg-[#e3372e]/80"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          ) : null} */}
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getAvailableWorkoutDays().map((day) => {
              // Only use real database data
              const dayData = realWorkoutData[day]
              const hasData = dayData && dayData.exercises.length > 0
              
              return (
                <Button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  variant={selectedDay === day ? "default" : "outline"}
                  className={`flex-shrink-0 ${
                    selectedDay === day 
                      ? 'bg-[#e3372e] text-white hover:bg-[#e3372e]/80' 
                      : hasData
                        ? 'bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30'
                        : 'bg-black text-white border-gray-700 hover:bg-gray-900'
                  } rounded-lg`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{day}</div>
                    {hasData && (
                      <div className="text-xs opacity-80">
                        {dayData.exercises.length} exercises
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Workout Day Content */}
        {selectedDay && realWorkoutData[selectedDay] && (
          <div className="space-y-6">
            {(() => {
              const dayData = getSelectedDayData()
              
              if (!dayData || dayData.exercises.length === 0) {
                return null
                /* return (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedDay}
                    </h3>
                    <p className="text-gray-400">
                      No workout data found for {selectedDay}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Complete your workout to see tracking data here
                    </p>
                  </div>
                ) */
              }

              return (
                <div>
                  {/* Day Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {dayData.workout_day_name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        Last updated: {new Date(dayData.latest_date).toLocaleDateString()}
                      </span>
                      <span className="text-green-400">
                        {dayData.completed_sets}/{dayData.total_sets} sets completed
                      </span>
                      <span className="text-blue-400">
                        {dayData.completed_reps}/{dayData.total_reps} reps completed
                      </span>
                    </div>
                  </div>

                  {/* Exercise Cards */}
                  <div className="space-y-4">
                    {dayData.exercises.map((exercise: any, exerciseIndex: number) => (
                      <div key={exercise.id} className="bg-[#2d2e2e]/50 border border-[#2d2e2e] rounded-2xl p-6">
                        {/* Exercise Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#e3372e] flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {exerciseIndex + 1}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {exercise.exercise_name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {exercise.required_sets} sets × {exercise.required_reps} reps
                                {exercise.suggested_rest_time > 0 && ` • ${exercise.suggested_rest_time}s rest`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              Required: {convertWeight(exercise.required_weight)} {weightUnit}
                            </div>
                            <div className="text-sm text-green-400">
                              Completed: {convertWeight(exercise.completed_weight)} {weightUnit}
                            </div>
                          </div>
                        </div>

                        {/* Sets Table */}
                        <div className="bg-black/30 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left p-3 text-gray-400 text-sm font-medium">{t('workout.tableHeaders.set')}</th>
                                <th className="text-left p-3 text-gray-400 text-sm font-medium">{t('workout.tableHeaders.weight')}</th>
                                <th className="text-left p-3 text-gray-400 text-sm font-medium">{t('workout.tableHeaders.reps')}</th>
                                <th className="text-left p-3 text-gray-400 text-sm font-medium">{t('workout.tableHeaders.rest')}</th>
                                <th className="text-center p-3 text-gray-400 text-sm font-medium">{t('workout.tableHeaders.status')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: exercise.required_sets }).map((_, setIndex) => {
                                const setType = getSetTypeLabel(setIndex, exercise.required_sets)
                                const isCompleted = setIndex < exercise.completed_sets
                                const exerciseId = `${exercise.id}_${setIndex}`
                                
                                return (
                                  <tr key={setIndex} className="border-b border-gray-800 last:border-b-0">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{setIndex + 1}</span>
                                        {setType && (
                                          <span className={`text-xs px-2 py-1 rounded ${
                                            setType === 'W' ? 'bg-blue-600/20 text-blue-400' : 'bg-red-600/20 text-red-400'
                                          }`}>
                                            {setType}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <Input
                                        type="text"
                                        value={editableWorkoutData[exerciseId]?.weight || convertWeight(isCompleted ? exercise.completed_weight : exercise.required_weight)}
                                        onChange={(e) => handleWorkoutInputChange(exercise.id, setIndex, 'weight', e.target.value)}
                                        className="bg-white/10 border-gray-600 text-white text-sm w-24"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <Input
                                        type="text"
                                        value={editableWorkoutData[exerciseId]?.reps || (isCompleted ? exercise.completed_reps : exercise.required_reps)}
                                        onChange={(e) => handleWorkoutInputChange(exercise.id, setIndex, 'reps', e.target.value)}
                                        className="bg-white/10 border-gray-600 text-white text-sm w-20"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <span className="text-blue-400">
                                        {exercise.suggested_rest_time}s
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <Button
                                        onClick={() => toggleSetCompletion(exercise.id, setIndex)}
                                        size="sm"
                                        className={`w-20 h-8 text-xs font-medium transition-all ${
                                          completedSets.has(`${exercise.id}_${setIndex}`)
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                      >
                                        {completedSets.has(`${exercise.id}_${setIndex}`) ? (
                                          <div className="flex items-center justify-center gap-1">
                                            <Check className="w-3 h-3" />
                                            <span>{t('workout.completed')}</span>
                                          </div>
                                        ) : (
                                          <span>{t('workout.completed')}</span>
                                        )}
                                      </Button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Exercise Progress */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white font-medium">
                              {(() => {
                                const totalSets = exercise.required_sets
                                const completedCount = Array.from({ length: totalSets })
                                  .filter((_, setIndex) => completedSets.has(`${exercise.id}_${setIndex}`)).length
                                return totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0
                              })()}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#e3372e] to-[#ff6b6b] h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(() => {
                                  const totalSets = exercise.required_sets
                                  const completedCount = Array.from({ length: totalSets })
                                    .filter((_, setIndex) => completedSets.has(`${exercise.id}_${setIndex}`)).length
                                  return totalSets > 0 ? (completedCount / totalSets) * 100 : 0
                                })()}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Superset Option */}
                  <div className="bg-[#e3372e]/10 border border-[#e3372e]/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e3372e] flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">SUPERSET</h4>
                          <p className="text-gray-400 text-sm">Add superset exercises</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-[#e3372e]/20">
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-white font-medium">0</span>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-[#e3372e]/20">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Send to AI Coach Button */}
        {selectedDay && realWorkoutData[selectedDay] && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <Button
                onClick={() => setShowWorkoutSummary(true)}
                className="bg-gradient-to-r from-[#e3372e] to-[#ff6b6b] hover:from-[#e3372e]/90 hover:to-[#ff6b6b]/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5" />
                  <span>Send it to your AI coach</span>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </Button>
              <p className="text-gray-400 text-sm mt-2">
                Get personalized feedback and analysis from your AI coach
              </p>
            </div>
          </div>
        )}

        {/* Original Workout Schedule Section */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#e3372e] animate-spin mx-auto mb-4" />
              <p className="text-gray-300">{t('workout.analyzing')}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && !workoutSchedule && (
          <div className="text-center py-20">
            <p className="text-yellow-400 text-lg mb-4">{error}</p>
            <Link href="/chat">
              <Button className="bg-[#e3372e] text-white hover:bg-[#e3372e]/80">
                {t('workout.goToChat')}
              </Button>
            </Link>
          </div>
        )}

        {/* Workout Schedule */}
        {!loading && workoutSchedule && workoutSchedule.days && workoutSchedule.days.length > 0 && (
          <div className="space-y-6">
            {/* Day Selector Tabs */}
            <Tabs value={selectedDayIndex.toString()} onValueChange={(value) => setSelectedDayIndex(parseInt(value))}>
              <div className="overflow-x-auto">
                <TabsList className="bg-[#2d2e2e]/50 border border-[#2d2e2e] p-1 h-auto w-full overflow-x-auto whitespace-nowrap flex-nowrap scrollbar-hide">
                {workoutSchedule.days.map((day, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="data-[state=active]:bg-[#e3372e] data-[state=active]:text-white text-gray-300 hover:text-white min-w-[100px] md:min-w-[120px] flex-shrink-0 h-auto py-2"
                  >
                    <div className="text-center px-2 w-full">
                      <div className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">{day.dayName}</div>
                      <div className="text-[10px] sm:text-xs opacity-80 line-clamp-1">{day.summary}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .line-clamp-1 {
                  display: -webkit-box;
                  -webkit-line-clamp: 1;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
              `}</style>
              </div>

              {/* Workout Day Content */}
              {workoutSchedule.days.map((day, dayIndex) => {
                const dayExercises = getExercisesForDay(dayIndex)
                return (
                <TabsContent key={dayIndex} value={dayIndex.toString()} className="mt-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[#e3372e]" />
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {day.dayName}
                      </h2>
                    </div>
                    <p className="text-gray-300 text-lg md:text-xl mb-1">
                      {day.summary}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {t('workout.exercisesCount', { count: dayExercises.length, sets: dayExercises.reduce((total, ex) => total + ex.sets, 0) })}
                    </p>
                  </div>

                  {/* Exercise Cards */}
                  <div className="space-y-4">
                    {dayExercises.length > 0 ? (
                      dayExercises.map((exercise, index) => {
                        // Find the first incomplete exercise to be the current one
                        const firstIncompleteIndex = dayExercises.findIndex(ex => !ex.completed)
                        const isCurrentExercise = !exercise.completed && index === firstIncompleteIndex
                        
                        return (
                          <div
                            key={exercise.id}
                            className="bg-[#e3372e] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 shadow-lg hover:shadow-xl transition-shadow"
                          >
                            {/* Left side - Icon and Exercise Info */}
                            <div 
                              className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer mb-3 md:mb-0"
                              onClick={() => handleToggleExercise(exercise.id)}
                            >
                              {/* Checkmark or Number */}
                              <div className="flex-shrink-0">
                                {exercise.completed ? (
                                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center">
                                    <Check className="w-6 h-6 md:w-7 md:h-7 text-[#e3372e]" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-[#e3372e] font-bold text-lg md:text-xl">
                                      {index + 1}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Exercise Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                                  {exercise.name}
                                </h3>
                                <p className="text-gray-200 text-sm md:text-base">
                                  {exercise.sets} sets × {exercise.reps} {typeof exercise.reps === 'string' ? '' : 'reps'} • {exercise.rest}s rest
                                </p>
                              </div>
                            </div>

                            {/* Right side - Input Rows for sets */}
                            <div className="flex-shrink-0 w-full md:w-[55%] mt-2 md:mt-0">
                              {/* Weight Unit Selector */}
                              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                                <label className="block text-white/90 text-sm font-medium mb-2">{t('workout.weightUnit')}</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setWeightUnit('kg')}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium text-center transition-colors ${
                                      weightUnit === 'kg' 
                                        ? 'bg-[#e3372e] text-white' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                  >
                                    {t('workout.kilograms')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setWeightUnit('lb')}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium text-center transition-colors ${
                                      weightUnit === 'lb' 
                                        ? 'bg-[#e3372e] text-white' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                  >
                                    {t('workout.pounds')}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {Array.from({ length: exercise.sets }).map((_, rowIdx) => {
                                  const row = exerciseInputs[exercise.id]?.rows?.[rowIdx] || { weight: "", reps: "", actualWeight: "", notes: "" }
                                  return (
                                    <div key={`${exercise.id}-row-${rowIdx}`} className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/10 p-3 rounded-lg">
                                      <div>
                                        <label className="block text-white/90 text-xs mb-1">{t('workout.weight')} ({weightUnit})</label>
                                        <Input
                                          type="text"
                                          inputMode="text"
                                          value={row.weight}
                                          onChange={(e) => handleInputChange(exercise.id, rowIdx, 'weight', e.target.value)}
                                          className="bg-white text-black text-sm md:text-base w-full"
                                          placeholder="50kg or 120lb"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-white/90 text-xs mb-1">{t('workout.reps')}</label>
                                        <Input
                                          type="number"
                                          inputMode="numeric"
                                          value={row.reps}
                                          onChange={(e) => handleInputChange(exercise.id, rowIdx, 'reps', e.target.value)}
                                          className="bg-white text-black rounded-md text-sm md:text-base w-full"
                                          placeholder="reps"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-white/90 text-xs mb-1">Actual Weight</label>
                                        <Input
                                          type="text"
                                          inputMode="text"
                                          value={row.actualWeight}
                                          onChange={(e) => handleInputChange(exercise.id, rowIdx, 'actualWeight', e.target.value)}
                                          className="bg-white text-black rounded-md text-sm md:text-base w-full"
                                          placeholder="52.5kg or 125lb"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-white/90 text-xs mb-1">Notes</label>
                                        <Textarea
                                          value={row.notes}
                                          onChange={(e) => handleInputChange(exercise.id, rowIdx, 'notes', e.target.value)}
                                          className="bg-white text-black rounded-md text-sm md:text-base w-full min-h-[60px]"
                                          placeholder={t('workout.notesPlaceholder')}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Optional current exercise indicator */}
                              {isCurrentExercise && (
                                <p className="text-white/80 text-xs mt-2">{t('workout.currentExercise')}</p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        {t('workout.noExercises')}
                      </div>
                    )}
                  </div>

                  {/* Send button for the day */}
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      {/* Tracking status removed */}
                    </div>
                    <Button
                      onClick={() => {
                        sendDaySubmission(dayIndex).finally(() => {
                          // Reset the sending state after navigation
                          setSending(false)
                        })
                      }}
                      className={`rounded-lg px-5 py-2 font-semibold transition-colors ${
                        sending 
                          ? 'bg-gray-400 text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      disabled={sending}
                    >
                      {sending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('workout.sending')}
                        </div>
                      ) : t('workout.send')}
                    </Button>
                  </div>
                </TabsContent>
                )
              })}
            </Tabs>
          </div>
        )}

        {/* No Schedule State */}
        {!loading && !error && Object.keys(realWorkoutData).length === 0 && (
          null
          /* <div className="text-center py-20">
            <p className="text-gray-300 text-lg mb-4">
              {t('workout.noScheduleDesc')}
            </p>
            <Link href="/chat">
              <Button className="bg-[#e3372e] text-white hover:bg-[#e3372e]/80">
                {t('workout.goToChat')}
              </Button>
            </Link>
          </div> */
        )}

        {/* Workout Summary Modal */}
        {showWorkoutSummary && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-700 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-[#e3372e]" />
                    <h2 className="text-2xl font-bold text-white">Workout Summary</h2>
                  </div>
                  <Button
                    onClick={() => setShowWorkoutSummary(false)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-gray-400 mt-2">
                  Review your workout and add notes before sending to your AI coach
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {(() => {
                  const dayData = getSelectedDayData()
                  if (!dayData) return null

                  return (
                    <div className="space-y-6">
                      {/* Workout Overview */}
                      <div className="bg-[#2d2e2e]/50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          📋 {dayData.workout_day_name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-[#e3372e]">
                              {dayData.exercises.length}
                            </div>
                            <div className="text-sm text-gray-400">Exercises</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">
                              {dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)}
                            </div>
                            <div className="text-sm text-gray-400">Total Sets</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-400">
                              {(() => {
                                const totalSets = dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)
                                const completedCount = Array.from({ length: totalSets })
                                  .filter((_, setIndex) => {
                                    return dayData.exercises.some((ex: any) => completedSets.has(`${ex.id}_${setIndex}`))
                                  }).length
                                return completedCount
                              })()}
                            </div>
                            <div className="text-sm text-gray-400">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-400">
                              {(() => {
                                const totalSets = dayData.exercises.reduce((sum: number, ex: any) => sum + ex.required_sets, 0)
                                const completedCount = Array.from({ length: totalSets })
                                  .filter((_, setIndex) => {
                                    return dayData.exercises.some((ex: any) => completedSets.has(`${ex.id}_${setIndex}`))
                                  }).length
                                return Math.round((completedCount / totalSets) * 100)
                              })()}%
                            </div>
                            <div className="text-sm text-gray-400">Progress</div>
                          </div>
                        </div>
                      </div>

                      {/* Exercise Details with Notes */}
                      <div className="space-y-4">
                        {dayData.exercises.map((exercise: any, exerciseIndex: number) => (
                          <div key={exercise.id} className="bg-black/30 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">
                              {exerciseIndex + 1}. {exercise.exercise_name}
                            </h4>
                            
                            {/* Sets with Notes */}
                            <div className="space-y-3">
                              {Array.from({ length: exercise.required_sets }).map((_, setIndex) => {
                                const setKey = `${exercise.id}_${setIndex}`
                                const isCompleted = completedSets.has(setKey)
                                
                                return (
                                  <div key={setIndex} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-fit">
                                      <span className="text-white font-medium">Set {setIndex + 1}</span>
                                      {isCompleted && (
                                        <Check className="w-4 h-4 text-green-400" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <Textarea
                                        placeholder="Add notes about this set (form, difficulty, feelings...)"
                                        value={workoutNotes[setKey] || ''}
                                        onChange={(e) => handleWorkoutNoteChange(exercise.id, setIndex, e.target.value)}
                                        className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 resize-none h-20"
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-gray-700 p-6 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowWorkoutSummary(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={sendWorkoutToCoach}
                    disabled={sendingToCoach}
                    className="bg-gradient-to-r from-[#e3372e] to-[#ff6b6b] hover:from-[#e3372e]/90 hover:to-[#ff6b6b]/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    {sendingToCoach ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Send to AI Coach</span>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Back Button */}
        <div className="md:hidden mt-8">
          <Link href="/">
            <Button 
              variant="outline" 
              className="bg-black text-white border-gray-700 hover:bg-gray-900 rounded-lg w-full"
            >
              {t('workout.backToHome')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Analyze performance modal */}
      {analyzeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-[#1a1b1b] border border-[#2d2e2e] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2d2e2e]">
              <h3 className="text-lg font-bold text-white">{t('workout.analyzePerformance')}</h3>
              <button
                type="button"
                onClick={closeAnalyze}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {analyzeStep === 'picker' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Record, choose a video (up to 4.4 MB), or paste a URL for larger files.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={startRecordFlow}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#e3372e]/20 border-2 border-[#e3372e]/50 text-white hover:bg-[#e3372e]/30 hover:border-[#e3372e] transition-colors"
                    >
                      <Video className="w-10 h-10" />
                      <span className="font-semibold">Record with camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={chooseFromGallery}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#2d2e2e] border-2 border-[#3d3e3e] text-white hover:bg-[#3d3e3e] hover:border-[#4d4e4e] transition-colors"
                    >
                      <Upload className="w-10 h-10" />
                      <span className="font-semibold">Choose from library</span>
                    </button>
                  </div>
                  <div className="pt-2 border-t border-[#2d2e2e]">
                    <p className="text-gray-400 text-xs mb-2">Analyze from URL (for large videos, e.g. Google Drive, Dropbox direct link)</p>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://…"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="flex-1 bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500"
                      />
                      <Button
                        onClick={() => sendVideoUrl(videoUrlInput)}
                        className="bg-[#e3372e] hover:bg-[#c41e3a] text-white shrink-0"
                      >
                        Analyze from URL
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {analyzeStep === 'record' && (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  </div>
                  <div className="flex gap-3">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                        <Video className="w-4 h-4 mr-2" />
                        Start recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        <Square className="w-4 h-4 mr-2 fill-current" />
                        Stop & analyze
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {analyzeStep === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-gray-300">
                  <Loader2 className="w-14 h-14 text-[#e3372e] animate-spin" />
                  <p className="font-medium">Analyzing your performance…</p>
                  <p className="text-sm text-gray-500">This may take a minute.</p>
                </div>
              )}

              {analyzeStep === 'result' && analysisResult && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e] max-h-80 overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{analysisResult}</p>
                  </div>
                  <Button onClick={closeAnalyze} className="w-full bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                    Close
                  </Button>
                </div>
              )}

              {analyzeStep === 'error' && analyzeError && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/50 text-red-200 text-sm">
                    {analyzeError}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={closeAnalyze} variant="outline" className="flex-1 border-gray-600 text-gray-300">
                      Close
                    </Button>
                    <Button onClick={() => { setAnalyzeStep('picker'); setAnalyzeError(null); }} className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                      Try again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

