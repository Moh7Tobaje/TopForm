"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PerformanceResultCards } from "@/components/analysis/PerformanceResultCards"
import Link from "next/link"

export default function MVPCoachApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

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
      
      // Set the structured analysis result
      setAnalysisResult(result.analysis)
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
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-center items-center">
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

          
          {/* My History Button */}
          <Link href="/My History">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base font-medium rounded-lg w-full max-w-md flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>My History</span>
            </Button>
          </Link>

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4 max-w-2xl w-full border border-gray-700/50 max-h-[85vh] overflow-y-auto">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">Analysis Result</h2>
              <div className="text-left">
                <PerformanceResultCards analysisResult={analysisResult} />
              </div>
              <Button
                onClick={closeResult}
                className="bg-red-600 hover:bg-red-700 text-white mt-3 text-sm"
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

