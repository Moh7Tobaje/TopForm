// Get environment variables with fallbacks
const GLM_API_KEY = process.env.GLM_API_KEY
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
    
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
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
      return `⚠️ API Error: ${error.message}`
    }
    
    return `⚠️ Unknown error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}


