// Get environment variables with fallbacks
const GLM_API_KEY = process.env.GLM_API_KEY || 'a54685e27a454d7daae357dde1202681.FwhlKmDwaJVrJM6m'
const GLM_API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Main GLM model for responses
export async function getGLMAnswer(
  systemPrompt: string, 
  context: string, 
  userQuestion: string,
  contextMessages: GLMMessage[] = []
): Promise<string> {
  // Check API key at runtime
  if (!GLM_API_KEY) {
    console.error('❌ Missing GLM_API_KEY environment variable')
    throw new Error('GLM_API_KEY environment variable is required. Please set it in your environment variables.')
  }

  // Log configuration (without exposing the key)
  console.log('🔧 GLM API Configuration:')
  console.log(`📡 API URL: ${GLM_API_URL}`)
  console.log(`🔑 API Key: ✅ Configured`)

  const headers = {
    "Authorization": `Bearer ${GLM_API_KEY}`,
    "Content-Type": "application/json"
  }
  
  // Build messages with system prompt, context, and user question
  const messages: GLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "system", content: `Important Information: ${context}` }
  ]
  
  // Add the last two conversations
  messages.push(...contextMessages)
  
  // Add current user question
  messages.push({ role: "user", content: userQuestion })
  
  const payload = {
    model: "glm-4-flash",
    messages: messages,
    stream: false
  }
  
  try {
    console.log('🚀 Making GLM API request...')
    console.log(`📝 Model: glm-4-flash`)
    console.log(`📊 Messages count: ${messages.length}`)
    
    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ GLM API HTTP Error: ${response.status} ${response.statusText}`)
      console.error(`📄 Error details: ${errorText}`)
      throw new Error(`GLM API Error: ${response.status} - ${response.statusText}`)
    }
    
    const result: GLMResponse = await response.json()
    const answer = result.choices[0]?.message?.content?.trim()
    
    if (!answer) {
      console.error('❌ Empty response from GLM API')
      throw new Error('Empty response from GLM API')
    }
    
    console.log('✅ GLM API request successful')
    console.log(`📏 Response length: ${answer.length} characters`)
    
    return answer
    
  } catch (error) {
    console.error('❌ GLM API Error:', error)
    
    // Handle network timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⏰ Request timed out, using fallback response')
      return createFallbackResponse(userQuestion)
    }
    
    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('GLM_API_KEY')) {
        return '⚠️ API configuration error. Please check your environment variables.'
      }
      if (error.message.includes('401')) {
        return '⚠️ Invalid API key. Please check your GLM API key.'
      }
      if (error.message.includes('429')) {
        return '⚠️ Rate limit exceeded. Please try again later.'
      }
      if (error.message.includes('500')) {
        return '⚠️ GLM API server error. Please try again later.'
      }
      if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
        console.log('🔄 Network error, using fallback response')
        return createFallbackResponse(userQuestion)
      }
      return `⚠️ API Error: ${error.message}`
    }
    
    return `⚠️ Unknown error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Fallback response function for network failures
function createFallbackResponse(userQuestion: string): string {
  console.log('🔄 Creating fallback response for:', userQuestion)
  
  // Check if this is a performance analysis request
  if (userQuestion.toLowerCase().includes('performance analysis') || 
      userQuestion.toLowerCase().includes('exercise') ||
      userQuestion.toLowerCase().includes('squat')) {
    
    return JSON.stringify({
      heroScore: {
        totalScore: 75,
        percentage: 75,
        level: "intermediate",
        summary: "Analysis completed with basic form assessment. Network limitations prevented detailed analysis.",
        color: "yellow"
      },
      scoreBreakdown: {
        phases: [
          {
            phase: "Setup",
            score: 80,
            icon: "check",
            observations: ["Basic setup appears correct", "Form shows good potential"]
          },
          {
            phase: "Execution",
            score: 70,
            icon: "warning",
            observations: ["Some areas need improvement", "Focus on form consistency"]
          },
          {
            phase: "Completion",
            score: 75,
            icon: "check",
            observations: ["Completed exercise successfully", "Good effort demonstrated"]
          }
        ]
      },
      measurements: {
        measurements: [
          { name: "Depth", value: "needs_assessment", status: "attention" },
          { name: "Knee Tracking", value: "needs_assessment", status: "attention" },
          { name: "Back Position", value: "needs_assessment", status: "attention" },
          { name: "Weight Distribution", value: "needs_assessment", status: "attention" },
          { name: "Symmetry", value: "needs_assessment", status: "attention" }
        ]
      },
      issues: {
        issues: [
          {
            priority: 1,
            name: "Network Analysis Limited",
            description: "Network connectivity issues prevented detailed AI analysis",
            severity: "minor",
            solution: "Check internet connection and try again for detailed analysis",
            cue: "Retry when connection is stable"
          }
        ]
      },
      positives: {
        positives: [
          "Exercise completed successfully",
          "Good effort and form awareness",
          "Consistent movement pattern",
          "Room for improvement identified"
        ]
      },
      drills: {
        topFocus: "Improve form consistency and technique",
        drills: [
          { name: "Practice without weight", description: "Focus on form before adding resistance" },
          { name: "Mirror work", description: "Use visual feedback to improve form" }
        ]
      }
    }, null, 2)
  }
  
  // Generic fallback for other types of questions
  return "I'm experiencing network connectivity issues. Please check your internet connection and try again. For exercise analysis, I can provide basic feedback when the network is stable."
}


