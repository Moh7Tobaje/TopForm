import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { analyzeLatestConversation } from '@/conversation-analyzer-orchestrator'

export async function POST(request: NextRequest) {
  console.log('=== TEST ANALYSIS API START ===')
  
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`🧪 Testing analysis for user: ${clerkUserId}`)

    // Run the analysis
    const result = await analyzeLatestConversation(clerkUserId)
    
    console.log('✅ Analysis test completed')
    console.log(`Results: ${JSON.stringify(result, null, 2)}`)

    return NextResponse.json({
      success: true,
      testResults: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Analysis test endpoint. Use POST to test the conversation analysis system.',
    usage: 'POST /api/test-analysis with valid Clerk authentication'
  })
}
