'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function DebugProgressPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createSampleData = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/progress/create-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, data })
        toast.success('Sample data created successfully!')
      } else {
        setResult({ success: false, error: data.error, details: data.details })
        toast.error('Failed to create sample data')
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testProgressAPI = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/progress/enhanced-dashboard?timeRange=7d&realTime=true')
      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, apiTest: data })
        toast.success('Progress API test successful!')
      } else {
        setResult({ success: false, error: data.error, details: data.details })
        toast.error('Progress API test failed')
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen circuit-pattern-dense bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Database className="w-8 h-8 text-[#e3372e]" />
              Progress System Debug
            </h1>
            <p className="text-gray-400">
              Test and debug the progress tracking system
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-red-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Sample Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Insert sample workout, nutrition, and insights data to test the system.
                </p>
                <Button 
                  onClick={createSampleData}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Sample Data'}
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-dark-gray border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Test Progress API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Test the enhanced dashboard API to verify data integration.
                </p>
                <Button 
                  onClick={testProgressAPI}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Testing...' : 'Test API'}
                </Button>
              </CardContent>
            </Card>
          </div>

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
                      <h4 className="font-semibold text-white mb-2">Data Inserted:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{result.data.dataInserted.workouts}</div>
                          <div className="text-xs text-gray-400">Workouts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{result.data.dataInserted.nutrition}</div>
                          <div className="text-xs text-gray-400">Nutrition</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{result.data.dataInserted.records}</div>
                          <div className="text-xs text-gray-400">Records</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{result.data.dataInserted.insights}</div>
                          <div className="text-xs text-gray-400">Insights</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.success && result.apiTest && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">API Response:</h4>
                      <div className="bg-background/50 rounded p-4 border border-border">
                        <pre className="text-xs text-gray-300 overflow-auto">
                          {JSON.stringify(result.apiTest, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {!result.success && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Error Details:</h4>
                      <div className="bg-red-500/20 rounded p-4 border border-red-500">
                        <p className="text-red-300">{result.error}</p>
                        {result.details && (
                          <ul className="mt-2 text-sm text-red-400">
                            {Array.isArray(result.details) ? 
                              result.details.map((detail: string, i: number) => (
                                <li key={i}>• {detail}</li>
                              )) : 
                              <li>• {result.details}</li>
                            }
                          </ul>
                        )}
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
              <CardTitle className="text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-gray-300">
                <li>1. Click "Create Sample Data" to insert test data into the database</li>
                <li>2. Click "Test Progress API" to verify the API works with the data</li>
                <li>3. Check the results section for success/failure details</li>
                <li>4. Visit the progress page to see the data in action</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-500/20 rounded border border-yellow-500">
                <p className="text-yellow-300 text-sm">
                  <strong>Note:</strong> This will create sample data for your user account only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
