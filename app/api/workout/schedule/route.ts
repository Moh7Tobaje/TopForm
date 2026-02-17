import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser, getAllConversationHistory } from '@/lib/database'

export async function GET(request: NextRequest) {
  console.log('=== WORKOUT SCHEDULE API START ===')
  
  try {
    console.log('Step 1: Getting Clerk user ID...')
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Step 2: Getting or creating user in database...')
    // Get or create user in our database
    const userId = await getOrCreateUser(clerkUserId)
    console.log('User ID:', userId)
    
    console.log('Step 3: Getting all conversation history...')
    // Get all conversation history for workout extraction
    const conversationHistory = await getAllConversationHistory(userId)
    console.log('Conversation history length:', conversationHistory.length)
    
    if (conversationHistory.length === 0) {
      console.log('No conversation history found')
      return NextResponse.json({ 
        schedule: null,
        message: 'No conversations found. Start chatting with your AI coach to create a workout plan!'
      })
    }
    
    console.log('Step 4: Workout schedule extraction model has been removed...')
    // Workout schedule extraction model has been removed
    const workoutSchedule = null
    console.log('Workout schedule extraction disabled')
    
    if (!workoutSchedule) {
      return NextResponse.json({ 
        schedule: null,
        message: 'Workout schedule extraction model has been disabled. Please consult with your AI coach directly for workout plans.'
      })
    }
    
    console.log('Step 5: Returning workout schedule...')
    return NextResponse.json({ 
      schedule: workoutSchedule,
      message: 'Workout schedule extracted successfully'
    })
    
  } catch (error) {
    console.error('Workout Schedule API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        schedule: null
      }, 
      { status: 500 }
    )
  }
}

