import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import {
  getOrCreateUser,
  saveMessage,
  getConversationHistory,
  getUserMessageCount,
  getLatestImportantInfo,
  insertMemory,
  searchMemories,
} from '@/lib/database'
import { getGLMAnswer, GLMMessage } from '@/lib/glm-api'
import { getEmbedding } from '@/lib/google-embeddings'
import { promises as fs } from 'fs'
import path from 'path'
import { analyzeLatestConversation } from '@/conversation-analyzer-orchestrator'

export async function POST(request: NextRequest) {
  console.log('=== CHAT STREAMING API START ===')
  
  try {
    console.log('Step 1: Getting Clerk user ID...')
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('Step 2: Parsing request body...')
    const { message } = await request.json()
    console.log('Message received:', message)
    
    if (!message || typeof message !== 'string') {
      console.log('ERROR: Invalid message format')
      return new Response('Message is required', { status: 400 })
    }

    return await processStreamingRequest(request, clerkUserId, message)
    
  } catch (error) {
    console.error('Chat Streaming API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // إرسال خطأ عبر الـ stream
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const errorData = `data: ${JSON.stringify({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          done: true
        })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      }
    })
    
    return new Response(errorStream, {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }
}

export async function GET(request: NextRequest) {
  console.log('=== CHAT STREAMING API GET START ===')
  
  try {
    console.log('Step 1: Getting Clerk user ID...')
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('Step 2: Parsing URL parameters...')
    const { searchParams } = new URL(request.url)
    const message = searchParams.get('message')
    console.log('Message received:', message)
    
    if (!message || typeof message !== 'string') {
      console.log('ERROR: Invalid message format')
      return new Response('Message is required', { status: 400 })
    }

    return await processStreamingRequest(request, clerkUserId, message)
    
  } catch (error) {
    console.error('Chat Streaming API GET Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // إرسال خطأ عبر الـ stream
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const errorData = `data: ${JSON.stringify({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          done: true
        })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      }
    })
    
    return new Response(errorStream, {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }
}

async function processStreamingRequest(request: NextRequest, clerkUserId: string, message: string) {
  try {
    console.log('Step 3: Getting or creating user in database...')
    const userId = await getOrCreateUser(clerkUserId)
    console.log('User ID:', userId)
    
    console.log('Step 4: Saving user message...')
    await saveMessage(userId, 'user', message)
    console.log('User message saved')

    console.log('Step 5: Getting message count...')
    const messageCount = await getUserMessageCount(userId)
    console.log('Message count:', messageCount)
    
    console.log('Step 6: Getting conversation history...')
    const lastTwo = await getConversationHistory(userId, 4)
    console.log('Last two conversations count:', lastTwo.length)

    console.log('Step 7: Reading system prompt from file...')
    const promptPath = path.join(process.cwd(), 'prompt.txt')
    let systemPrompt: string
    
    try {
      systemPrompt = await fs.readFile(promptPath, 'utf-8')
      console.log('System prompt loaded successfully')
    } catch (error) {
      console.error('Error reading prompt file, using default prompt:', error)
      systemPrompt = `# Default System Prompt
You are assistant. Please ensure prompt.txt exists in the root directory.`
    }

    // === RAG: build embedding + retrieve similar memories from memory_store ===
    // Create embedding for user message to search for similar conversations
    console.log('Step 8: Getting embedding for user message (RAG search)...')
    const queryEmbedding = await getEmbedding(message)

    let retrievedContext = ''
    if (queryEmbedding) {
      console.log('Step 8.1: Searching similar conversation pairs...')
      // Search for more relevant memories with better similarity threshold
      // Increased match count and similarity threshold for better quality results
      const matches = await searchMemories(userId, queryEmbedding, 8, 0.65)
      if (matches.length > 0) {
        // Format retrieved conversation pairs professionally
        retrievedContext = matches
          .map((m, index) => {
            const role = m.metadata?.role || 'conversation_pair'
            const date = m.created_at ? new Date(m.created_at).toLocaleDateString('ar-SA') : 'unknown date'
            const similarity = m.similarity ? `(تشابه: ${(m.similarity * 100).toFixed(1)}%)` : ''
            
            // If it's a conversation pair, format it nicely
            if (role === 'conversation_pair' && m.metadata?.user_message && m.metadata?.assistant_response) {
              const userMsg = m.metadata.user_message.length > 300 
                ? m.metadata.user_message.substring(0, 300) + '...' 
                : m.metadata.user_message
              const assistantMsg = m.metadata.assistant_response.length > 400 
                ? m.metadata.assistant_response.substring(0, 400) + '...' 
                : m.metadata.assistant_response
              
              return `${index + 1}. محادثة سابقة [${date}] ${similarity}\n   سؤال المستخدم: ${userMsg}\n   إجابة المدرب: ${assistantMsg}`
            } else {
              // Fallback for old format or other types
              const content = m.content.length > 500 ? m.content.substring(0, 500) + '...' : m.content
              return `${index + 1}. [${date}] ${similarity}\n   ${content}`
            }
          })
          .join('\n\n')
        console.log('Retrieved conversation pairs count:', matches.length)
      } else {
        console.log('No similar conversation pairs found')
      }
    } else {
      console.log('Embedding not available (check GOOG_API_KEY). Skipping RAG retrieval.')
    }

    // Get existing important info from database
    console.log('Step 9: Getting existing important info...')
    const importantInfo = await getLatestImportantInfo(userId) || '{}'
    console.log('Important info length:', importantInfo.length)

    // Combine profile summary, retrieved RAG memories, and the latest conversation turns
    const ragSection = retrievedContext
      ? `\n\n# ذكريات محادثات سابقة ذات صلة (Retrieved Relevant Memories)\nهذه معلومات من محادثات سابقة مع المستخدم قد تساعد في تقديم إجابة أفضل:\n\n${retrievedContext}\n\nملاحظة: استخدم هذه المعلومات كسياق إضافي، لكن ركز على الإجابة على السؤال الحالي للمستخدم.`
      : ''

    const combinedContext = `# User Profile (JSON)\n${importantInfo}${ragSection}`

    // === الحصول على إجابة GLM ===
    console.log('Step 10: Getting GLM answer...')
    const answer = await getGLMAnswer(systemPrompt, combinedContext, message, lastTwo)
    console.log('GLM answer received, length:', answer.length)

    console.log('Step 11: Saving assistant response...')
    await saveMessage(userId, 'assistant', answer)
    console.log('Assistant response saved')

    // === Conversation Analysis System Integration ===
    console.log('Step 11.1: Running conversation analysis...')
    // Run analysis in background without blocking the response
    analyzeLatestConversation(clerkUserId)
      .then(result => {
        if (result.success) {
          console.log(`✅ Analysis completed: ${result.classification}`)
          if (result.workoutChangesSaved) {
            console.log('💪 Workout changes saved to database')
          }
          if (result.nutritionChangesSaved) {
            console.log('🥗 Nutrition changes saved to database')
          }
        } else {
          console.log(`⚠️ Analysis failed: ${result.error}`)
        }
      })
      .catch(error => {
        console.error('❌ Conversation analysis error:', error)
      })
    console.log('Step 11.2: Analysis started in background')

    // === RAG: Save conversation pair (user message + assistant response) as a single memory ===
    // This creates a unified embedding for the entire conversation pair
    if (queryEmbedding) {
      console.log('Step 12: Creating conversation pair embedding...')
      
      // Combine user message and assistant response into a conversation pair
      const conversationPair = `سؤال المستخدم: ${message}\n\nإجابة المدرب: ${answer}`
      
      // Create embedding for the entire conversation pair
      const pairEmbedding = await getEmbedding(conversationPair)
      
      if (pairEmbedding) {
        console.log('Step 12.1: Inserting conversation pair into memory_store...')
        await insertMemory(userId, conversationPair, pairEmbedding, {
          role: 'conversation_pair',
          source: 'chat_conversation',
          timestamp: new Date().toISOString(),
          message_type: 'conversation_pair',
          user_message: message,
          assistant_response: answer,
          user_message_length: message.length,
          assistant_response_length: answer.length,
          pair_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique ID for this pair
        })
        console.log('Conversation pair saved successfully to memory_store')
      } else {
        console.log('Failed to create embedding for conversation pair')
      }
    }

    // === إنشاء Stream للرد ===
    console.log('Step 13: Creating streaming response...')
    
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        // تقسيم الإجابة إلى أجزاء صغيرة جداً للـ streaming
        const chunkSize = 3 // تقليل عدد الأحرف لسرعة أكبر
        let index = 0
        
        const sendChunk = () => {
          if (index < answer.length) {
            const chunk = answer.slice(index, index + chunkSize)
            const data = `data: ${JSON.stringify({ 
              chunk, 
              done: false,
              messageCount: messageCount + 1
            })}\n\n`
            controller.enqueue(encoder.encode(data))
            index += chunkSize
            
            // إرسال الجزء التالي فوراً بدون تأخير تقريباً
            setTimeout(sendChunk, 20) // تقليل التأخير لـ 20ms فقط
          } else {
            // إرسال إشارة الانتهاء
            const finalData = `data: ${JSON.stringify({ 
              chunk: '', 
              done: true,
              messageCount: messageCount + 1
            })}\n\n`
            controller.enqueue(encoder.encode(finalData))
            controller.close()
          }
        }
        
        // بدء إرسال الـ chunks فوراً
        sendChunk()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('Chat Streaming API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // إرسال خطأ عبر الـ stream
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const errorData = `data: ${JSON.stringify({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          done: true
        })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      }
    })
    
    return new Response(errorStream, {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }
}
