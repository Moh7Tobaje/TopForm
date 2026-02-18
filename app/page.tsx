"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Target, TrendingUp, Shield, Lightbulb } from "lucide-react"

export default function MVPCoachApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    exercise: { name: string; variation: string }
    overall: { score: number; level: string; summary: string }
    scores: { setup: { score: number; notes: string[] }; execution: { score: number; notes: string[] }; completion: { score: number; notes: string[] } }
    measurements: { depth: string; knee_tracking: string; back_position: string; weight_distribution: string; symmetry: string }
    issues: { priority: number; problem: string; severity: string; fix: string; cue: string }[]
    positives: string[]
    safety_alerts: string[]
    top_focus: string
    drills: string[]
  }>({
    exercise: { name: '', variation: '' },
    overall: { score: 0, level: '', summary: '' },
    scores: { setup: { score: 0, notes: [] }, execution: { score: 0, notes: [] }, completion: { score: 0, notes: [] } },
    measurements: { depth: '', knee_tracking: '', back_position: '', weight_distribution: '', symmetry: '' },
    issues: [],
    positives: [],
    safety_alerts: [],
    top_focus: '',
    drills: []
  })

  const supportedExercises = ["Squat", "Deadlift", "Bench Press", "OHP", "Rows"]

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert('File must be less than 50MB')
      return
    }
    setSelectedFile(file)
  }

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      
      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const result = await response.json()
      
      // Parse the JSON analysis result
      let analysisData
      try {
        analysisData = JSON.parse(result.analysis)
      } catch {
        // Fallback if not JSON
        analysisData = {
          exercise: { name: 'unknown', variation: 'unknown' },
          overall: { score: 75, level: 'intermediate', summary: result.analysis },
          scores: { setup: { score: 75, notes: [] }, execution: { score: 75, notes: [] }, completion: { score: 75, notes: [] } },
          measurements: { depth: '', knee_tracking: '', back_position: '', weight_distribution: '', symmetry: '' },
          issues: [],
          positives: [],
          safety_alerts: [],
          top_focus: '',
          drills: []
        }
      }
      
    setAnalysisResult(analysisData)
      setShowResult(true)
      
    } catch (error) {
      console.error('Analysis error:', error)
      alert(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setIsUploading(false)
    }
  }

  const closeResult = () => {
    setShowResult(false)
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">FA</span>
          </div>
          <span className="font-semibold">FormAI</span>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Analyze Your Form</h1>
            <p className="text-gray-400">Upload a workout video to get AI feedback</p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/mov"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  {selectedFile ? (
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  )}
                </div>
                <p className="text-lg">
                  {selectedFile ? selectedFile.name : 'Drag video here or click to upload'}
                </p>
                <p className="text-sm text-gray-500">MP4, MOV (max 50MB)</p>
              </div>
            </label>
          </div>

          {/* Exercises */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Supported exercises:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedExercises.map((exercise) => (
                <span key={exercise} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  {exercise}
                </span>
              ))}
            </div>
          </div>

          {/* Button */}
          <Button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isUploading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-12 py-4 text-lg font-semibold rounded-lg w-full max-w-md"
          >
            {isUploading ? 'Analyzing...' : 'Upload and Analyze'}
          </Button>
        </div>
      </main>

      {/* Analysis Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {analysisResult.exercise.name.charAt(0).toUpperCase() + analysisResult.exercise.name.slice(1)} Analysis
              </h2>
              <p className="text-gray-400">{analysisResult.exercise.variation}</p>
            </div>

            {/* Overall Score */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Overall Score
                  </h3>
                  <p className="text-gray-400">{analysisResult.overall.level}</p>
                </div>
                <div className={`text-5xl font-bold ${
                  analysisResult.overall.score >= 90 ? 'text-green-500' :
                  analysisResult.overall.score >= 80 ? 'text-yellow-500' :
                  analysisResult.overall.score >= 70 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  {analysisResult.overall.score}%
                </div>
              </div>
              <p className="text-gray-300 mt-4">{analysisResult.overall.summary}</p>
            </div>

            {/* Phase Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Setup</h4>
                <div className={`text-2xl font-bold ${
                  analysisResult.scores.setup.score >= 80 ? 'text-green-500' :
                  analysisResult.scores.setup.score >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {analysisResult.scores.setup.score}%
                </div>
                {analysisResult.scores.setup.notes.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    {analysisResult.scores.setup.notes.slice(0, 2).map((note, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Execution</h4>
                <div className={`text-2xl font-bold ${
                  analysisResult.scores.execution.score >= 80 ? 'text-green-500' :
                  analysisResult.scores.execution.score >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {analysisResult.scores.execution.score}%
                </div>
                {analysisResult.scores.execution.notes.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    {analysisResult.scores.execution.notes.slice(0, 2).map((note, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Completion</h4>
                <div className={`text-2xl font-bold ${
                  analysisResult.scores.completion.score >= 80 ? 'text-green-500' :
                  analysisResult.scores.completion.score >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {analysisResult.scores.completion.score}%
                </div>
                {analysisResult.scores.completion.notes.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    {analysisResult.scores.completion.notes.slice(0, 2).map((note, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Form Measurements</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Depth:</span>
                  <span className={`ml-2 font-medium ${
                    analysisResult.measurements.depth === 'below_parallel' ? 'text-green-500' :
                    analysisResult.measurements.depth === 'at_parallel' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {analysisResult.measurements.depth.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Knees:</span>
                  <span className={`ml-2 font-medium ${
                    analysisResult.measurements.knee_tracking === 'optimal' ? 'text-green-500' :
                    analysisResult.measurements.knee_tracking.includes('slight') ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {analysisResult.measurements.knee_tracking.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Back:</span>
                  <span className={`ml-2 font-medium ${
                    analysisResult.measurements.back_position === 'neutral' ? 'text-green-500' :
                    analysisResult.measurements.back_position.includes('slight') ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {analysisResult.measurements.back_position.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Balance:</span>
                  <span className={`ml-2 font-medium ${
                    analysisResult.measurements.weight_distribution === 'midfoot' || analysisResult.measurements.weight_distribution === 'heels' ? 'text-green-500' :
                    'text-red-500'
                  }`}>
                    {analysisResult.measurements.weight_distribution}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Symmetry:</span>
                  <span className={`ml-2 font-medium ${
                    analysisResult.measurements.symmetry === 'balanced' ? 'text-green-500' :
                    'text-yellow-500'
                  }`}>
                    {analysisResult.measurements.symmetry}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {analysisResult.issues.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priority Issues
                </h4>
                <div className="space-y-3">
                  {analysisResult.issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        issue.severity === 'critical' ? 'bg-red-600 text-white' :
                        issue.severity === 'moderate' ? 'bg-orange-600 text-white' :
                        'bg-yellow-600 text-black'
                      }`}>
                        {issue.priority}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{issue.problem}</p>
                        <p className="text-gray-400 text-xs mt-1">{issue.fix}</p>
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          {issue.cue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Alerts */}
            {analysisResult.safety_alerts.length > 0 && (
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety Alerts
                </h4>
                <ul className="space-y-1">
                  {analysisResult.safety_alerts.map((alert, index) => (
                    <li key={index} className="text-orange-300 text-sm">{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Positive Points */}
            {analysisResult.positives.length > 0 && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  What You Did Well
                </h4>
                <ul className="space-y-1">
                  {analysisResult.positives.map((positive, index) => (
                    <li key={index} className="text-green-300 text-sm">{positive}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Focus Area */}
            {analysisResult.top_focus && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Next Session Focus
                </h4>
                <p className="text-blue-300 text-sm">{analysisResult.top_focus}</p>
              </div>
            )}

            {/* Recommended Drills */}
            {analysisResult.drills.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recommended Drills
                </h4>
                <ul className="space-y-1">
                  {analysisResult.drills.map((drill, index) => (
                    <li key={index} className="text-purple-300 text-sm">{drill}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={closeResult}
              className="bg-red-600 hover:bg-red-700 text-white w-full"
            >
              Analyze Another Video
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

