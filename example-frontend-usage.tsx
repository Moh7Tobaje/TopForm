// Example of how to use the structured performance analysis data in React components
import React from 'react';
import type { PerformanceAnalysisResult } from './types/performance-analysis';

interface ResultCardsProps {
  analysisResult: PerformanceAnalysisResult;
}

export const ResultCards: React.FC<ResultCardsProps> = ({ analysisResult }) => {
  const { heroScore, scoreBreakdown, measurements, issues, positives, drills, safetyAlert } = analysisResult;

  // Hero Score Card Component
  const HeroScoreCard = () => (
    <div className={`hero-score-card ${heroScore.color}`}>
      <div className="score-display">
        <h1>{heroScore.totalScore}</h1>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${heroScore.percentage}%` }}
          />
        </div>
        <p className="level">{heroScore.level}</p>
        <p className="summary">{heroScore.summary}</p>
      </div>
    </div>
  );

  // Score Breakdown Card Component
  const ScoreBreakdownCard = () => (
    <div className="score-breakdown-card">
      <h3>Score Breakdown</h3>
      {scoreBreakdown.phases.map((phase, index) => (
        <div key={index} className="phase-row">
          <span className="phase-name">{phase.phase}</span>
          <span className="phase-score">{phase.score}/100</span>
          <div className="mini-progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${phase.score}%` }}
            />
          </div>
          <span className={`icon ${phase.icon}`}>
            {phase.icon === 'check' ? '✓' : phase.icon === 'warning' ? '⚠' : '✗'}
          </span>
          {phase.observations.length > 0 && (
            <div className="observations">
              {phase.observations.map((obs, i) => (
                <p key={i} className="observation">{obs}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Measurements Card Component
  const MeasurementsCard = () => (
    <div className="measurements-card">
      <h3>Measurements</h3>
      {measurements.measurements.map((measurement, index) => (
        <div key={index} className={`measurement-item ${measurement.status}`}>
          <span className="measurement-name">{measurement.name}</span>
          <span className="measurement-value">{measurement.value}</span>
        </div>
      ))}
    </div>
  );

  // Issues Card Component
  const IssuesCard = () => (
    <div className="issues-card">
      <h3>Issues & Corrections</h3>
      {issues.issues.map((issue, index) => (
        <div key={index} className={`issue-item ${issue.severity}`}>
          <div className="issue-header">
            <span className="priority">#{issue.priority}</span>
            <h4>{issue.name}</h4>
          </div>
          <p className="issue-description">{issue.description}</p>
          <div className="issue-solution">
            <h5>Solution:</h5>
            <p>{issue.solution}</p>
          </div>
          <div className="issue-cue">
            <strong>Cue:</strong> "{issue.cue}"
          </div>
        </div>
      ))}
    </div>
  );

  // Positives Card Component
  const PositivesCard = () => (
    <div className="positives-card">
      <h3>What You Did Well</h3>
      {positives.positives.map((positive, index) => (
        <div key={index} className="positive-item">
          <span className="check-mark">✓</span>
          <span>{positive}</span>
        </div>
      ))}
    </div>
  );

  // Drills Card Component
  const DrillsCard = () => (
    <div className="drills-card">
      <h3>Improvement Plan</h3>
      <div className="top-focus">
        <strong>Top Focus:</strong> {drills.topFocus}
      </div>
      <div className="drills-list">
        <h4>Recommended Drills:</h4>
        {drills.drills.map((drill, index) => (
          <div key={index} className="drill-item">
            <h5>{drill.name}</h5>
            {drill.description && <p>{drill.description}</p>}
            {drill.videoLink && (
              <a href={drill.videoLink} target="_blank" rel="noopener noreferrer">
                Watch Video
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Safety Alert Component
  const SafetyAlert = () => {
    if (!safetyAlert) return null;
    
    return (
      <div className="safety-alert">
        <div className="alert-content">
          <h3>⚠️ Safety Alert</h3>
          <p><strong>{safetyAlert.message}</strong></p>
          <p>{safetyAlert.recommendation}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="performance-results">
      {/* Safety Alert first if present */}
      <SafetyAlert />
      
      {/* Hero Score - Most prominent */}
      <HeroScoreCard />
      
      {/* Two-column layout for remaining cards */}
      <div className="cards-grid">
        <div className="left-column">
          <ScoreBreakdownCard />
          <MeasurementsCard />
          <PositivesCard />
        </div>
        <div className="right-column">
          <IssuesCard />
          <DrillsCard />
        </div>
      </div>
    </div>
  );
};

// Example usage in a page component:
export const AnalysisResultsPage: React.FC<{ analysisData: PerformanceAnalysisResult }> = ({ analysisData }) => {
  return (
    <div className="analysis-page">
      <header>
        <h1>Performance Analysis Results</h1>
      </header>
      <main>
        <ResultCards analysisResult={analysisData} />
      </main>
    </div>
  );
};
