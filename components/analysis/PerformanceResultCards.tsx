"use client"

import React from 'react'
import type { PerformanceAnalysisResult } from '@/types/performance-analysis'

interface PerformanceResultCardsProps {
  analysisResult: PerformanceAnalysisResult | null | undefined;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PerformanceResultCardsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PerformanceResultCards Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-red-900/40 border border-red-500/50">
          <h3 className="text-red-400 font-bold mb-2">⚠️ Display Error</h3>
          <p className="text-red-300 mb-2">
            There was an error displaying the performance analysis results.
          </p>
          <details className="text-red-200 text-sm">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 p-2 bg-red-950/50 rounded overflow-auto">
              {this.state.error?.message}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const PerformanceResultCardsInner: React.FC<PerformanceResultCardsProps> = ({ analysisResult }) => {
  // Add comprehensive null checks and default values
  if (!analysisResult) {
    return (
      <div className="p-6 rounded-xl bg-yellow-900/40 border border-yellow-500/50">
        <h3 className="text-yellow-400 font-bold mb-2">⚠️ No Data Available</h3>
        <p className="text-yellow-300">
          No analysis results are available to display.
        </p>
      </div>
    )
  }

  // Destructure with default values to prevent errors
  const {
    heroScore,
    scoreBreakdown,
    measurements,
    issues,
    positives,
    drills,
    safetyAlert
  } = analysisResult;

  // Validate required data with fallbacks
  if (!heroScore || !scoreBreakdown || !measurements || !positives || !drills) {
    console.error('Missing required data in analysisResult:', analysisResult)
    return (
      <div className="p-6 rounded-xl bg-orange-900/40 border border-orange-500/50">
        <h3 className="text-orange-400 font-bold mb-2">⚠️ Incomplete Data</h3>
        <p className="text-orange-300">
          The analysis results are incomplete. Please try the analysis again.
        </p>
      </div>
    )
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'attention': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      case 'warning': return 'text-orange-400 bg-orange-900/20 border-orange-500/50';
      case 'problem': return 'text-red-400 bg-red-900/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/50';
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/40 border-red-500/50';
      case 'moderate': return 'bg-yellow-900/40 border-yellow-500/50';
      case 'minor': return 'bg-gray-900/40 border-gray-500/50';
      default: return 'bg-gray-900/40 border-gray-500/50';
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'check': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      {/* Safety Alert */}
      {safetyAlert && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-500/50">
          <h3 className="text-red-400 font-bold mb-2">⚠️ Safety Alert</h3>
          <p className="text-red-300 font-medium">{safetyAlert.message}</p>
          <p className="text-red-200 text-sm mt-1">{safetyAlert.recommendation}</p>
        </div>
      )}

      {/* Hero Score Card */}
      <div className={`p-6 rounded-xl ${getColorClasses(heroScore.color || 'gray')} bg-opacity-20 border border-opacity-50`}>
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{heroScore.totalScore || 0}</div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full ${getColorClasses(heroScore.color || 'gray')}`}
              style={{ width: `${heroScore.percentage || 0}%` }}
            />
          </div>
          <div className="text-xl font-semibold mb-2">{heroScore.level || 'Unknown'}</div>
          <p className="text-gray-300">{heroScore.summary || 'No summary available'}</p>
        </div>
      </div>

      {/* Score Breakdown */}
      {scoreBreakdown.phases && scoreBreakdown.phases.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e]">
          <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
          {scoreBreakdown.phases.map((phase, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-[#3d3e3e] last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{phase.phase || 'Unknown Phase'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{phase.score || 0}/100</span>
                  <span className="text-lg">{getIcon(phase.icon || 'error')}</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${getColorClasses((phase.score || 0) >= 70 ? 'green' : (phase.score || 0) >= 50 ? 'yellow' : (phase.score || 0) >= 40 ? 'orange' : 'red')}`}
                  style={{ width: `${phase.score || 0}%` }}
                />
              </div>
              {phase.observations && phase.observations.length > 0 && (
                <div className="text-sm text-gray-400">
                  {phase.observations.map((obs, i) => (
                    <p key={i}>• {obs}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Measurements */}
      {measurements.measurements && measurements.measurements.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e]">
          <h3 className="text-lg font-semibold mb-4">Measurements</h3>
          <div className="space-y-3">
            {measurements.measurements.map((measurement, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusClasses(measurement.status || 'attention')}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{measurement.name || 'Unknown'}</span>
                  <span className="text-sm">{measurement.value || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {issues && issues.issues && issues.issues.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e]">
          <h3 className="text-lg font-semibold mb-4">Issues & Corrections</h3>
          <div className="space-y-4">
            {issues.issues.map((issue, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityClasses(issue.severity || 'minor')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">#{issue.priority || 0}</span>
                  <h4 className="font-semibold">{issue.name || 'Unknown Issue'}</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">{issue.description || 'No description available'}</p>
                <div className="text-sm">
                  <p className="font-medium text-gray-200 mb-1">Solution:</p>
                  <p className="text-gray-400 mb-2">{issue.solution || 'No solution provided'}</p>
                  <p className="text-gray-300"><span className="font-medium">Cue:</span> "{issue.cue || 'No cue available'}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {positives && positives.positives && positives.positives.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e]">
          <h3 className="text-lg font-semibold mb-4">What You Did Well</h3>
          <div className="space-y-2">
            {positives.positives.map((positive, index) => (
              <div key={index} className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>{positive}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drills */}
      {drills && (
        <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e]">
          <h3 className="text-lg font-semibold mb-4">Improvement Plan</h3>
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-300"><span className="font-medium">Top Focus:</span> {drills.topFocus || 'No focus specified'}</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Recommended Drills:</h4>
            {drills.drills && drills.drills.map((drill, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-lg">
                <h5 className="font-medium mb-1">{drill.name || 'Unknown Drill'}</h5>
                {drill.description && <p className="text-sm text-gray-400">{drill.description}</p>}
                {drill.videoLink && (
                  <a 
                    href={drill.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline"
                  >
                    Watch Video →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PerformanceResultCards: React.FC<PerformanceResultCardsProps> = ({ analysisResult }) => (
  <PerformanceResultCardsErrorBoundary>
    <PerformanceResultCardsInner analysisResult={analysisResult} />
  </PerformanceResultCardsErrorBoundary>
);
