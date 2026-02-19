// Performance Analysis Result Types

export interface HeroScoreCard {
  totalScore: number; // 0-100
  percentage: number; // 0-100
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  summary: string; // One sentence summary
  color: 'green' | 'yellow' | 'orange' | 'red'; // Based on score range
}

export interface ScoreBreakdownItem {
  phase: 'Setup' | 'Execution' | 'Completion';
  score: number; // 0-100
  icon: 'check' | 'warning' | 'error'; // Based on score: 70+ check, 50-69 warning, <50 error
  observations: string[]; // List of specific observations for this phase
}

export interface ScoreBreakdownCard {
  phases: ScoreBreakdownItem[];
}

export interface MeasurementItem {
  name: 'Depth' | 'Knee Tracking' | 'Back Position' | 'Weight Distribution' | 'Symmetry';
  value: string;
  status: 'good' | 'attention' | 'warning' | 'problem'; // For color coding
}

export interface MeasurementsCard {
  measurements: MeasurementItem[];
}

export interface IssueItem {
  priority: number; // 1 for most important, 2, 3, etc.
  name: string;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  solution: string; // Step-by-step solution
  cue: string; // Short cue for user to think about during exercise
}

export interface IssuesCard {
  issues: IssueItem[];
}

export interface PositivesCard {
  positives: string[]; // 2-4 positive points, each starting with a green check
}

export interface DrillItem {
  name: string;
  description?: string;
  videoLink?: string;
}

export interface DrillsCard {
  topFocus: string; // One sentence about most important thing to work on
  drills: DrillItem[]; // 2-3 specific drills
}

export interface SafetyAlert {
  message: string;
  recommendation: string;
}

export interface PerformanceAnalysisResult {
  heroScore: HeroScoreCard;
  scoreBreakdown: ScoreBreakdownCard;
  measurements: MeasurementsCard;
  issues: IssuesCard;
  positives: PositivesCard;
  drills: DrillsCard;
  safetyAlert?: SafetyAlert; // Only present if there are safety concerns
}

// Helper functions for determining colors and icons
export function getScoreColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score >= 81) return 'green';
  if (score >= 61) return 'yellow';
  if (score >= 41) return 'orange';
  return 'red';
}

export function getScoreIcon(score: number): 'check' | 'warning' | 'error' {
  if (score >= 70) return 'check';
  if (score >= 50) return 'warning';
  return 'error';
}

export function getPerformanceLevel(score: number): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
  if (score >= 90) return 'elite';
  if (score >= 70) return 'advanced';
  if (score >= 50) return 'intermediate';
  return 'beginner';
}
