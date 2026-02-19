import { getGLMAnswer } from '../glm-api'
import type { 
  PerformanceAnalysisResult, 
  HeroScoreCard, 
  ScoreBreakdownCard, 
  MeasurementsCard, 
  IssuesCard, 
  PositivesCard, 
  DrillsCard,
  SafetyAlert,
  getScoreColor,
  getScoreIcon,
  getPerformanceLevel
} from '../types/performance-analysis'

const SYSTEM_PROMPT = `You are an expert fitness analysis AI. Your task is to convert exercise performance analysis text into structured JSON data for a fitness coaching application.

You will receive raw analysis text from a video analysis system. You must extract and organize the information into the exact JSON structure specified below.

IMPORTANT RULES:
1. You must respond with ONLY valid JSON - no explanations, no markdown, no code blocks
2. If information is missing from the analysis, make reasonable inferences based on typical exercise patterns
3. Scores should be realistic (0-100) and consistent with the analysis tone
4. Always provide at least 2-4 positive points, even for poor performances
5. Prioritize issues by actual importance for safety and performance
6. Be specific and actionable with solutions and cues

JSON Structure:
{
  "heroScore": {
    "totalScore": number (0-100),
    "percentage": number (0-100),
    "level": "beginner" | "intermediate" | "advanced" | "elite",
    "summary": "string (one sentence summary)",
    "color": "green" | "yellow" | "orange" | "red"
  },
  "scoreBreakdown": {
    "phases": [
      {
        "phase": "Setup" | "Execution" | "Completion",
        "score": number (0-100),
        "icon": "check" | "warning" | "error",
        "observations": ["string", "string"]
      }
    ]
  },
  "measurements": {
    "measurements": [
      {
        "name": "Depth" | "Knee Tracking" | "Back Position" | "Weight Distribution" | "Symmetry",
        "value": "string",
        "status": "good" | "attention" | "warning" | "problem"
      }
    ]
  },
  "issues": {
    "issues": [
      {
        "priority": number (1=highest),
        "name": "string",
        "description": "string",
        "severity": "critical" | "moderate" | "minor",
        "solution": "string (step-by-step)",
        "cue": "string (short cue for exercise)"
      }
    ]
  },
  "positives": {
    "positives": ["string", "string", "string", "string"]
  },
  "drills": {
    "topFocus": "string (one sentence)",
    "drills": [
      {
        "name": "string",
        "description": "string (optional)",
        "videoLink": "string (optional)"
      }
    ]
  },
  "safetyAlert": {
    "message": "string",
    "recommendation": "string"
  }
}

Note: safetyAlert should only be included if there are actual safety concerns mentioned in the analysis.

Measurement Values:
- Depth: "below_parallel" | "at_parallel" | "above_parallel" | "quarter"
- Knee Tracking: "optimal" | "slight_valgus" | "moderate_valgus" | "severe_valgus" | "varus"
- Back Position: "neutral" | "slight_rounding" | "excessive_rounding"
- Weight Distribution: "midfoot" | "heels" | "toes" | "uneven"
- Symmetry: "balanced" | "left_dominant" | "right_dominant"

Color/Status Logic:
- Scores 81-100: green/good
- Scores 61-80: yellow/attention  
- Scores 41-60: orange/warning
- Scores 0-40: red/problem
- Icons: 70+ = check, 50-69 = warning, <50 = error
- Levels: 90+ = elite, 70+ = advanced, 50+ = intermediate, <50 = beginner`

export async function processAnalysisWithGLM(analysisText: string): Promise<PerformanceAnalysisResult> {
  const userPrompt = `Convert this exercise performance analysis into structured JSON:

${analysisText}

Extract all relevant information and organize it according to the specified JSON structure. If certain information isn't explicitly mentioned, make reasonable inferences based on the overall analysis tone and content.`

  try {
    const response = await getGLMAnswer(SYSTEM_PROMPT, '', userPrompt)
    
    // Clean the response to ensure it's valid JSON
    let jsonStr = response.trim()
    
    // Remove any potential markdown code blocks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\s*/, '').replace(/```\s*$/, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\s*/, '').replace(/```\s*$/, '')
    }
    
    const parsedResult = JSON.parse(jsonStr) as PerformanceAnalysisResult
    
    // Validate and ensure required structure
    return validateAndEnhanceResult(parsedResult, analysisText)
    
  } catch (error) {
    console.error('Error processing analysis with GLM:', error)
    throw new Error(`Failed to process analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function validateAndEnhanceResult(result: PerformanceAnalysisResult, originalAnalysis: string): PerformanceAnalysisResult {
  // Ensure heroScore has all required fields
  if (!result.heroScore) {
    result.heroScore = createDefaultHeroScore()
  }
  
  // Ensure scoreBreakdown has all three phases
  if (!result.scoreBreakdown) {
    result.scoreBreakdown = { phases: [] }
  }
  
  const requiredPhases: Array<'Setup' | 'Execution' | 'Completion'> = ['Setup', 'Execution', 'Completion']
  requiredPhases.forEach(phase => {
    if (!result.scoreBreakdown.phases.find(p => p.phase === phase)) {
      result.scoreBreakdown.phases.push(createDefaultPhase(phase))
    }
  })
  
  // Ensure measurements has all required items
  if (!result.measurements) {
    result.measurements = { measurements: [] }
  }
  
  const requiredMeasurements: Array<'Depth' | 'Knee Tracking' | 'Back Position' | 'Weight Distribution' | 'Symmetry'> = [
    'Depth', 'Knee Tracking', 'Back Position', 'Weight Distribution', 'Symmetry'
  ]
  
  requiredMeasurements.forEach(measurement => {
    if (!result.measurements.measurements.find(m => m.name === measurement)) {
      result.measurements.measurements.push(createDefaultMeasurement(measurement))
    }
  })
  
  // Ensure issues exists (can be empty array)
  if (!result.issues) {
    result.issues = { issues: [] }
  }
  
  // Ensure positives has at least 2 items
  if (!result.positives || !result.positives.positives || result.positives.positives.length < 2) {
    result.positives = { positives: generateDefaultPositives(originalAnalysis) }
  }
  
  // Ensure drills exists
  if (!result.drills) {
    result.drills = createDefaultDrills()
  }
  
  // Remove safetyAlert if there are no actual safety concerns
  if (result.safetyAlert && !hasSafetyConcerns(originalAnalysis)) {
    delete result.safetyAlert
  }
  
  return result
}

function createDefaultHeroScore(): HeroScoreCard {
  const score = 50 // Default middle score
  return {
    totalScore: score,
    percentage: score,
    level: score >= 90 ? 'elite' : score >= 70 ? 'advanced' : score >= 50 ? 'intermediate' : 'beginner',
    summary: 'Performance shows room for improvement across multiple areas.',
    color: score >= 81 ? 'green' : score >= 61 ? 'yellow' : score >= 41 ? 'orange' : 'red'
  }
}

function createDefaultPhase(phase: 'Setup' | 'Execution' | 'Completion'): any {
  const score = 50 // Default middle score
  return {
    phase,
    score,
    icon: score >= 70 ? 'check' : score >= 50 ? 'warning' : 'error',
    observations: ['Needs attention in this phase']
  }
}

function createDefaultMeasurement(name: any): any {
  return {
    name,
    value: 'Needs assessment',
    status: 'attention'
  }
}

function generateDefaultPositives(analysis: string): string[] {
  const positives = [
    'Completed the exercise with good effort',
    'Showed commitment to proper form',
    'Demonstrated willingness to improve'
  ]
  
  // Try to extract actual positives from the analysis
  if (analysis.toLowerCase().includes('good') || analysis.toLowerCase().includes('well')) {
    positives.unshift('Some good form elements observed')
  }
  
  return positives.slice(0, 4)
}

function createDefaultDrills(): DrillsCard {
  return {
    topFocus: 'Focus on overall form and technique',
    drills: [
      { name: 'Bodyweight squats', description: 'Practice without weight to perfect form' },
      { name: 'Mirror practice', description: 'Perform exercises in front of mirror for visual feedback' }
    ]
  }
}

function hasSafetyConcerns(analysis: string): boolean {
  const safetyKeywords = [
    'injury', 'danger', 'risk', 'unsafe', 'harmful', 'pain',
    'stop', 'immediate', 'critical', 'severe', 'warning'
  ]
  
  return safetyKeywords.some(keyword => 
    analysis.toLowerCase().includes(keyword)
  )
}
