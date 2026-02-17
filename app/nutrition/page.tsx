"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import FloatingChatButton from "@/components/floating-chat-button"
import { useEffect, useState, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Camera, Upload, X, Loader2, Flame, Dumbbell, Wheat, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function NutritionPage() {
  const { t } = useLanguage()
  const [calories, setCalories] = useState<number | null>(null)
  const [requiredCalories, setRequiredCalories] = useState<number | null>(null)
  const [protein, setProtein] = useState<number | null>(null)
  const [requiredProtein, setRequiredProtein] = useState<number | null>(null)
  const [carbs, setCarbs] = useState<number | null>(null)
  const [requiredCarbs, setRequiredCarbs] = useState<number | null>(null)
  const [fat, setFat] = useState<number | null>(null)
  const [requiredFat, setRequiredFat] = useState<number | null>(null)
  const [source, setSource] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Analyze My Plate modal
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState<'picker' | 'capturing' | 'result' | 'error'>('picker')
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Log Meal modal
  const [logMealOpen, setLogMealOpen] = useState(false)
  const [logMealValues, setLogMealValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  interface AnalysisResult {
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: { name: string; calories: number; quantity: string }[];
  }

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/nutrition/metrics')
        if (!res.ok) {
          throw new Error(`Failed to load nutrition metrics: ${res.status}`)
        }
        const data = await res.json()
        if (isMounted) {
          setCalories(typeof data.calories === 'number' ? data.calories : null)
          setRequiredCalories(typeof data.requiredCalories === 'number' ? data.requiredCalories : null)
          setProtein(typeof data.protein === 'number' ? data.protein : null)
          setRequiredProtein(typeof data.requiredProtein === 'number' ? data.requiredProtein : null)
          setCarbs(typeof data.carbs === 'number' ? data.carbs : null)
          setRequiredCarbs(typeof data.requiredCarbs === 'number' ? data.requiredCarbs : null)
          setFat(typeof data.fat === 'number' ? data.fat : null)
          setRequiredFat(typeof data.requiredFat === 'number' ? data.requiredFat : null)
          setSource(data.source || '')
        }
      } catch (e) {
        console.error('nutrition metrics fetch error', e)
        if (isMounted) {
          setCalories(null)
          setRequiredCalories(null)
          setProtein(null)
          setRequiredProtein(null)
          setCarbs(null)
          setRequiredCarbs(null)
          setFat(null)
          setRequiredFat(null)
          setSource('')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => { isMounted = false }
  }, [])

  const calDisplay = loading ? '...' : `${requiredCalories ?? 'N/A'} / ${calories ?? 'N/A'}`
  const protDisplay = loading ? '...' : `${requiredProtein ?? 'N/A'} / ${protein ?? 'N/A'}`

  // Helper functions for circular progress
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, children }: { percentage: number; size?: number; strokeWidth?: number; children: React.ReactNode }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e3372e"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    )
  }

  // Generate date options
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date)
    }
    return dates
  }

  // Handle analysis result from API response (now JSON format)
  const handleAnalysisResult = (apiResponse: any): AnalysisResult => {
    try {
      console.log('API Response:', apiResponse) // Debug log

      // Direct mapping from API response to our interface
      return {
        mealName: apiResponse.mealName || "Analyzed Meal",
        calories: apiResponse.totalCalories || 0,
        protein: apiResponse.protein || 0,
        carbs: apiResponse.carbs || 0,
        fat: apiResponse.fat || 0,
        ingredients: Array.isArray(apiResponse.ingredients) 
          ? apiResponse.ingredients.map((ing: any) => ({
              name: ing.name || "Unknown Ingredient",
              calories: ing.calories || 0,
              quantity: ing.quantity || "1 serving"
            }))
          : [
              { name: "Food Item", calories: apiResponse.totalCalories || 100, quantity: "1 serving" }
            ]
      }
    } catch (error) {
      console.error('Error handling analysis result:', error)
      return {
        mealName: "Analyzed Meal",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: [
          { name: "Food Item", calories: 0, quantity: "1 serving" }
        ]
      }
    }
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
    setAnalyzeOpen(false)
    setAnalyzeStep('picker')
    setAnalyzeError(null)
    setAnalysisResult(null)
    setImageUrlInput('')
  }

  const startCameraFlow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        videoRef.current.playsInline = true
        videoRef.current.play().catch(() => {})
      }
      setAnalyzeStep('capturing')
      setAnalyzeError(null)
    } catch (e) {
      setAnalyzeError('Camera access denied or not available. Please allow camera and try again.')
      setAnalyzeStep('error')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          sendImage(file)
        }
      }, 'image/jpeg')
    }
  }

  const chooseFromGallery = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f && f.type.startsWith('image/')) {
      sendImage(f)
    } else if (f) {
      setAnalyzeError('Please select an image file.')
      setAnalyzeStep('error')
    }
  }

  const sendImage = async (file: File) => {
    setAnalyzeStep('result')
    setAnalyzeError(null)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    
    try {
      const formData = new FormData()
      formData.append('image', file, file.name)
      
      const response = await fetch('/api/nutrition/analyze-image', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }
      
      const analysis = handleAnalysisResult(data.analysis)
      setAnalysisResult(analysis)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setAnalyzeError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.')
      setAnalyzeStep('error')
    }
  }

  const sendImageUrl = async (url: string) => {
    const u = url.trim()
    if (!/^https?:\/\/.+\..+/.test(u)) {
      setAnalyzeError('Enter a valid URL (e.g. https://…).')
      setAnalyzeStep('error')
      return
    }
    setAnalyzeStep('result')
    setAnalyzeError(null)
    
    try {
      const formData = new FormData()
      formData.append('imageUrl', u)
      
      const response = await fetch('/api/nutrition/analyze-image', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }
      setAnalysisResult(handleAnalysisResult(data.analysis))
      setImageUrlInput('')
    } catch (error) {
      console.error('Error analyzing image URL:', error)
      setAnalyzeError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.')
      setAnalyzeStep('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#091110] relative overflow-hidden">
      {/* Speckled background effect - same style as workout page */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0.5px, transparent 0.5px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "15px 15px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{t('nutrition.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/">{t('workout.backToHome')}</Link>
            </Button>
          </div>
        </div>

        {/* Analyze My Plate Button */}
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
            Analyze My Plate
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Choose image"
        />

        {/* Main Nutrition Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calories Card */}
          <div className="bg-[#1a1b1b]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2d2e2e] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Calories</h3>
              <Flame className="w-6 h-6 text-[#e3372e]" />
            </div>
            <div className="flex items-center justify-center">
              <CircularProgress 
                percentage={requiredCalories && calories ? Math.min((calories / requiredCalories) * 100, 100) : 0}
                size={180}
                strokeWidth={12}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{Math.round(calories || 0)}</div>
                  <div className="text-sm text-gray-400">of {Math.round(requiredCalories || 0)} kcal</div>
                </div>
              </CircularProgress>
            </div>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Protein Card */}
            <div className="bg-[#1a1b1b]/50 backdrop-blur-sm rounded-2xl p-4 border border-[#2d2e2e] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-400">Protein</span>
              </div>
              <div className="flex items-center justify-center mb-3">
                <CircularProgress 
                  percentage={requiredProtein && protein ? Math.min((protein / requiredProtein) * 100, 100) : 0}
                  size={80}
                  strokeWidth={6}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{Math.round(protein || 0)}</div>
                    <div className="text-xs text-gray-400">g</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="text-center text-xs text-gray-400">
                of {Math.round(requiredProtein || 0)}g
              </div>
            </div>

            {/* Carbs Card */}
            <div className="bg-[#1a1b1b]/50 backdrop-blur-sm rounded-2xl p-4 border border-[#2d2e2e] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <Wheat className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-gray-400">Carbs</span>
              </div>
              <div className="flex items-center justify-center mb-3">
                <CircularProgress 
                  percentage={requiredCarbs && carbs ? Math.min((carbs / requiredCarbs) * 100, 100) : 0}
                  size={80}
                  strokeWidth={6}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{Math.round(carbs || 0)}</div>
                    <div className="text-xs text-gray-400">g</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="text-center text-xs text-gray-400">
                of {Math.round(requiredCarbs || 0)}g
              </div>
            </div>

            {/* Fat Card */}
            <div className="bg-[#1a1b1b]/50 backdrop-blur-sm rounded-2xl p-4 border border-[#2d2e2e] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-5 h-5 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400">Fat</span>
              </div>
              <div className="flex items-center justify-center mb-3">
                <CircularProgress 
                  percentage={requiredFat && fat ? Math.min((fat / requiredFat) * 100, 100) : 0}
                  size={80}
                  strokeWidth={6}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{Math.round(fat || 0)}</div>
                    <div className="text-xs text-gray-400">g</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="text-center text-xs text-gray-400">
                of {Math.round(requiredFat || 0)}g
              </div>
            </div>
          </div>
        </div>

        {/* New message */}
        <div className="mt-12 text-center">
          <p className="text-white/90 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
            {t('nutrition.betaMessage')}
          </p>
        </div>

        {/* Log Meal Button */}
        <button
          type="button"
          onClick={() => setLogMealOpen(true)}
          className="group relative w-full max-w-2xl mx-auto flex items-center justify-center gap-4 py-5 px-8 mt-8 mb-6 rounded-2xl overflow-hidden
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
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </span>
          <span className="relative text-white font-bold text-xl md:text-2xl tracking-tight drop-shadow-sm">
            Log Meal
          </span>
        </button>
      </div>

      {/* Floating chat button to go to /chat */}
      <FloatingChatButton />

      {/* Log Meal modal */}
      {logMealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-[#1a1b1b] border border-[#2d2e2e] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2d2e2e]">
              <h3 className="text-lg font-bold text-white">Log Meal</h3>
              <button
                type="button"
                onClick={() => setLogMealOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Calories */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#e3372e]" />
                      Calories
                    </label>
                    <span className="text-gray-400 text-sm">kcal</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={logMealValues.calories}
                    onChange={(e) => setLogMealValues(prev => ({ ...prev, calories: e.target.value }))}
                    className="bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500 text-lg"
                  />
                </div>

                {/* Protein */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-400" />
                      Protein
                    </label>
                    <span className="text-gray-400 text-sm">grams</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={logMealValues.protein}
                    onChange={(e) => setLogMealValues(prev => ({ ...prev, protein: e.target.value }))}
                    className="bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500 text-lg"
                  />
                </div>

                {/* Carbs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Wheat className="w-5 h-5 text-yellow-400" />
                      Carbs
                    </label>
                    <span className="text-gray-400 text-sm">grams</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={logMealValues.carbs}
                    onChange={(e) => setLogMealValues(prev => ({ ...prev, carbs: e.target.value }))}
                    className="bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500 text-lg"
                  />
                </div>

                {/* Fat */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-400" />
                      Fat
                    </label>
                    <span className="text-gray-400 text-sm">grams</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={logMealValues.fat}
                    onChange={(e) => setLogMealValues(prev => ({ ...prev, fat: e.target.value }))}
                    className="bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500 text-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => setLogMealOpen(false)} 
                    className="flex-1 bg-[#2d2e2e] hover:bg-[#3d3e3e] text-white border border-[#3d3e3e]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        // Validate that at least one field has a value
                        if (!logMealValues.calories && !logMealValues.protein && !logMealValues.carbs && !logMealValues.fat) {
                          alert('Please enter at least one nutritional value')
                          return
                        }

                        // Send data to the API (Clerk auth is handled automatically in the API route)
                        const response = await fetch('/api/nutrition/log-meal', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            calories: logMealValues.calories || '0',
                            protein: logMealValues.protein || '0',
                            carbs: logMealValues.carbs || '0',
                            fat: logMealValues.fat || '0'
                          })
                        })

                        if (response.ok) {
                          const result = await response.json()
                          console.log('Meal logged successfully:', result)
                          
                          // Close modal and reset form
                          setLogMealOpen(false)
                          setLogMealValues({ calories: '', protein: '', carbs: '', fat: '' })
                          
                          // Show success message
                          setShowSuccessMessage(true)
                          
                          // Hide success message after 3 seconds or on click
                          setTimeout(() => {
                            setShowSuccessMessage(false)
                          }, 3000)
                          
                          // Refresh nutrition metrics to show updated values
                          window.location.reload()
                        } else {
                          const errorData = await response.json()
                          alert(`Failed to log meal: ${errorData.error || 'Unknown error'}`)
                        }
                      } catch (error) {
                        console.error('Error logging meal:', error)
                        alert('Failed to log meal. Please try again.')
                      }
                    }}
                    className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white"
                  >
                    Log Meal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSuccessMessage(false)}
        >
          <div className="bg-[#1a1b1b] border border-[#2d2e2e] rounded-2xl p-8 shadow-2xl max-w-sm mx-4 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in">
            <div className="flex flex-col items-center space-y-4">
              {/* Green checkmark circle */}
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Done successfully</h3>
                <p className="text-sm text-gray-400">Tap anywhere to make it disappear</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze My Plate modal */}
      {analyzeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-[#1a1b1b] border border-[#2d2e2e] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2d2e2e]">
              <h3 className="text-lg font-bold text-white">Analyze My Plate</h3>
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
                  <p className="text-gray-400 text-sm">Take a photo or choose an image from your library to analyze your meal.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={startCameraFlow}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#e3372e]/20 border-2 border-[#e3372e]/50 text-white hover:bg-[#e3372e]/30 hover:border-[#e3372e] transition-colors"
                    >
                      <Camera className="w-10 h-10" />
                      <span className="font-semibold">Take photo</span>
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
                    <p className="text-gray-400 text-xs mb-2">Analyze from URL</p>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://…"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500"
                      />
                      <Button
                        onClick={() => sendImageUrl(imageUrlInput)}
                        className="bg-[#e3372e] hover:bg-[#c41e3a] text-white shrink-0"
                      >
                        Analyze
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {analyzeStep === 'capturing' && (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={capturePhoto} className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture photo
                    </Button>
                    <Button onClick={closeAnalyze} variant="outline" className="shrink-0 border-gray-600 text-white hover:bg-gray-800">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {analyzeStep === 'result' && analysisResult && (
                <div className="space-y-4">
                  {/* Meal Header */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{analysisResult.mealName}</h3>
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                      <Flame className="w-6 h-6 text-[#e3372e]" />
                      {analysisResult.calories}
                      <span className="text-sm font-normal text-gray-400">calories</span>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">Protein</div>
                      <div className="text-white text-lg font-bold">{analysisResult.protein}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold">Carbs</div>
                      <div className="text-white text-lg font-bold">{analysisResult.carbs}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">Fat</div>
                      <div className="text-white text-lg font-bold">{analysisResult.fat}g</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold mb-3">Ingredients</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analysisResult.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#2d2e2e]/50 rounded-lg border border-[#3d3e3e]">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#e3372e]"></div>
                            <span className="text-white font-medium">{ingredient.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">{ingredient.quantity}</span>
                            <span className="text-white font-semibold">{ingredient.calories} cal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setAnalyzeStep('picker')} className="flex-1 bg-[#2d2e2e] hover:bg-[#3d3e3e] text-white border border-[#3d3e3e]">
                      Analyze Another
                    </Button>
                    <Button 
                      onClick={async () => {
                        try {
                          // Send analysis data to the API
                          const response = await fetch('/api/nutrition/log-meal', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              calories: analysisResult.calories.toString(),
                              protein: analysisResult.protein.toString(),
                              carbs: analysisResult.carbs.toString(),
                              fat: analysisResult.fat.toString()
                            })
                          })

                          if (response.ok) {
                            const result = await response.json()
                            console.log('Meal added to diet successfully:', result)
                            
                            // Close the analyze modal
                            closeAnalyze()
                            
                            // Refresh nutrition metrics to show updated values
                            window.location.reload()
                          } else {
                            const errorData = await response.json()
                            alert(`Failed to add meal to diet: ${errorData.error || 'Unknown error'}`)
                          }
                        } catch (error) {
                          console.error('Error adding meal to diet:', error)
                          alert('Failed to add meal to diet. Please try again.')
                        }
                      }} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Add to My Diet
                    </Button>
                    <Button onClick={closeAnalyze} className="flex-1 bg-[#2d2e2e] hover:bg-[#3d3e3e] text-white border border-[#3d3e3e]">
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {analyzeStep === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/50">
                    <p className="text-red-400 text-sm">{analyzeError}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setAnalyzeStep('picker')} className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                      Try again
                    </Button>
                    <Button onClick={closeAnalyze} variant="outline" className="shrink-0 border-gray-600 text-white hover:bg-gray-800">
                      Cancel
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