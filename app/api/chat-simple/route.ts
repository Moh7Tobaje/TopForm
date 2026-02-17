import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHAT SIMPLE API START ===')
    
    // Step 1: Check Clerk authentication
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { message } = body
    
    if (!message || typeof message !== 'string') {
      console.log('ERROR: Invalid message format')
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('Message received:', message)

    // Step 3: Try to import and use Supabase
    try {
      const { supabase } = await import('@/lib/supabase')
      console.log('Supabase imported successfully')
      
      // Test database connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.log('Database connection error:', error)
        return NextResponse.json({ 
          error: 'Database connection failed',
          details: error.message
        }, { status: 500 })
      }
      
      console.log('Database connection successful')
      
    } catch (error) {
      console.log('Supabase import error:', error)
      return NextResponse.json({ 
        error: 'Supabase import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Step 4: Try to import database functions
    try {
      const { getOrCreateUser } = await import('@/lib/database')
      console.log('Database functions imported successfully')
      
      // Test user creation
      const userId = await getOrCreateUser(clerkUserId)
      console.log('User ID created/retrieved:', userId)
      
    } catch (error) {
      console.log('Database functions error:', error)
      return NextResponse.json({ 
        error: 'Database functions failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Step 5: Try to import GLM API
    try {
      const { getGLMAnswer } = await import('@/lib/glm-api')
      console.log('GLM API imported successfully')
      
      // Test GLM API with a simple message
      const testAnswer = await getGLMAnswer(
        'You are a helpful assistant.',
        'No context available.',
        'Hello, this is a test message.',
        []
      )
      
      console.log('GLM API test successful, response length:', testAnswer.length)
      
      return NextResponse.json({ 
        response: testAnswer,
        messageCount: 1,
        test: 'all_systems_working'
      })
      
    } catch (error) {
      console.log('GLM API error:', error)
      return NextResponse.json({ 
        error: 'GLM API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Chat Simple API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
