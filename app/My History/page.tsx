"use client"

import { useState, useEffect } from "react"
import { auth } from "@clerk/nextjs/server"
import { PerformanceResultCards } from "@/components/analysis/PerformanceResultCards"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AnalysisResult {
  id: number
  user_id: string
  analysis_result: any
  timestamp: string
}

export default function MyHistoryPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysisResults()
  }, [])

  const fetchAnalysisResults = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching analysis results:', error)
        setError('Failed to load analysis results')
        return
      }

      setAnalysisResults(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your analysis history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchAnalysisResults} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Top FormAi</Link>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">My Analysis History</h1>
          
          {analysisResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Analysis History Yet</h2>
              <p className="text-gray-400 mb-6">Start analyzing your workout videos to see them here</p>
              <Link href="/">
                <Button className="bg-red-600 hover:bg-red-700">
                  Analyze Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {analysisResults.map((result, index) => (
                <div key={result.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Analysis #{analysisResults.length - index}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {new Date(result.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <PerformanceResultCards analysisResult={result.analysis_result} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
