"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function MVPCoachApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    score: number
    feedback: string
    issues: string[]
  }>({
    score: 0,
    feedback: '',
    issues: []
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
      
      // Parse the analysis result to extract score and feedback
      const analysisText = result.analysis || 'Analysis could not be completed.'
      
      // Simple scoring based on analysis content (this could be improved)
      let score = 75 // default score
      let feedback = analysisText
      let issues: string[] = []
      
      // Extract score from analysis if available (basic implementation)
      if (analysisText.toLowerCase().includes('excellent') || analysisText.toLowerCase().includes('perfect')) {
        score = 95
      } else if (analysisText.toLowerCase().includes('good') || analysisText.toLowerCase().includes('solid')) {
        score = 85
      } else if (analysisText.toLowerCase().includes('needs') || analysisText.toLowerCase().includes('improve')) {
        score = 70
        // Extract improvement suggestions
        const lines = analysisText.split('\n').filter((line: string) => line.trim())
        issues = lines.slice(0, 3).map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      }

      setAnalysisResult({ score, feedback, issues })
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center space-y-6">
              {/* Score Circle */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="w-32 h-32 rounded-full border-4 border-gray-700 flex items-center justify-center">
                  <div className={`text-4xl font-bold ${
                    analysisResult.score >= 90 ? 'text-green-500' :
                    analysisResult.score >= 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {analysisResult.score}%
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Analysis Complete</h3>
                <p className="text-gray-300">{analysisResult.feedback}</p>
              </div>

              {/* Issues */}
              {analysisResult.issues.length > 0 && (
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Areas to improve:</h4>
                  <ul className="space-y-1">
                    {analysisResult.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {issue}
                      </li>
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
        </div>
      )}
    </div>
  )
}

