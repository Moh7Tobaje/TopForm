'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkles, RefreshCw, CheckCircle, AlertCircle, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'

export default function AIInsightsGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])

  const generateWeeklyInsights = async () => {
    setLoading(true)
    setResult(null)
    setInsights([])

    try {
      const response = await fetch('/api/progress/ai-insights-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, data })
        setInsights(data.insights || [])
        toast.success(`Generated ${data.insights?.length || 0} AI insights!`)
      } else {
        setResult({ success: false, error: data.error })
        toast.error('Failed to generate insights')
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const runCronJob = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/progress/weekly-insights-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, cronData: data })
        toast.success(`Processed ${data.summary?.totalUsers || 0} users`)
      } else {
        setResult({ success: false, error: data.error })
        toast.error('Cron job failed')
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentInsights = async () => {
    setLoading(true)
    setInsights([])

    try {
      const response = await fetch('/api/progress/enhanced-ai-insights?arabic=true&limit=10')
      const data = await response.json()

      if (response.ok) {
        setInsights(data.insights || [])
        setResult({ success: true, insightsData: data })
        toast.success(`Fetched ${data.insights?.length || 0} insights`)
      } else {
        setResult({ success: false, error: data.error })
        toast.error('Failed to fetch insights')
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'recommendation': return <Brain className="w-5 h-5 text-blue-500" />
      case 'motivation': return <Sparkles className="w-5 h-5 text-purple-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />
      default: return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-500'
    if (priority >= 4) return 'bg-orange-500'
    if (priority >= 3) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="min-h-screen circuit-pattern-dense bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-[#e3372e]" />
              AI Insights Generator
            </h1>
            <p className="text-gray-400">
              Generate intelligent fitness insights using GLM Flash AI
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-red-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Use GLM Flash to analyze your weekly data and generate personalized insights.
                </p>
                <Button 
                  onClick={generateWeeklyInsights}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : 'Generate Insights'}
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-dark-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Run Weekly Cron
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Run the automated weekly insights generation for all users.
                </p>
                <Button 
                  onClick={runCronJob}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Running...</> : 'Run Cron Job'}
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-red-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Fetch Recent Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Fetch your most recent AI insights with Arabic support.
                </p>
                <Button 
                  onClick={fetchRecentInsights}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Fetching...</> : 'Fetch Insights'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Insights */}
          {insights.length > 0 && (
            <Card className="gradient-dark-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-[#e3372e]" />
                  Generated Insights ({insights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="gradient-red-gray rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <h4 className="font-semibold text-white">{insight.title}</h4>
                            {insight.arabic && (
                              <h5 className="text-sm text-gray-300">{insight.arabic.title}</h5>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priorityLevel)}`} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm">{insight.message}</p>
                        {insight.arabic && (
                          <p className="text-gray-400 text-sm">{insight.arabic.message}</p>
                        )}
                      </div>

                      {insight.actionableAdvice && (
                        <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                          <p className="text-white text-sm">
                            💡 {insight.actionableAdvice}
                          </p>
                          {insight.arabic?.advice && (
                            <p className="text-gray-300 text-sm mt-1">
                              💡 {insight.arabic.advice}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <span>Priority: {insight.priorityLevel}/5</span>
                        <span>Relevance: {Math.round(insight.relevanceScore * 100)}%</span>
                        <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card className={`${result.success ? 'gradient-green-gray' : 'gradient-red-gray'} border-border shadow-lg`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {result.success ? 'Success' : 'Error'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.success && result.data && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Generated Insights:</h4>
                      <div className="bg-background/50 rounded p-4 border border-border">
                        <pre className="text-xs text-gray-300 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {result.success && result.cronData && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Cron Job Results:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{result.cronData.summary?.totalUsers || 0}</div>
                          <div className="text-xs text-gray-400">Total Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{result.cronData.summary?.successful || 0}</div>
                          <div className="text-xs text-gray-400">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">{result.cronData.summary?.failed || 0}</div>
                          <div className="text-xs text-gray-400">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">{result.cronData.summary?.totalInsights || 0}</div>
                          <div className="text-xs text-gray-400">Total Insights</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!result.success && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Error Details:</h4>
                      <div className="bg-red-500/20 rounded p-4 border border-red-500">
                        <p className="text-red-300">{result.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="gradient-dark-gray border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-gray-300">
                <li>1. Click "Generate Weekly Insights" to analyze your data with GLM Flash AI</li>
                <li>2. The AI analyzes your workouts, nutrition, and progress from the past week</li>
                <li>3. Insights are generated in both English and Arabic</li>
                <li>4. Insights are saved to the database and displayed in your progress page</li>
                <li>5. Use "Run Weekly Cron" to generate insights for all users automatically</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-500/20 rounded border border-blue-500">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Make sure you have GLM Flash API key configured in your environment variables.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
