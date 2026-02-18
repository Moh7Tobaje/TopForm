import { NextRequest, NextResponse } from 'next/server'

const TWELVELABS_BASE = process.env.TWELVELABS_API_URL || 'https://api.twelvelabs.io/v1.3'

export async function GET() {
  try {
    console.log('=== Twelve Labs API Key Test ===')
    console.log('API Key exists:', !!process.env.TWELVE_LABS_API_KEY)
    console.log('API Key starts with:', process.env.TWELVE_LABS_API_KEY?.substring(0, 10))
    console.log('API Key length:', process.env.TWELVE_LABS_API_KEY?.length)
    console.log('API URL:', TWELVELABS_BASE)

    const apiKey = process.env.TWELVE_LABS_API_KEY
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ 
        error: 'API key not configured',
        debug: {
          exists: !!process.env.TWELVE_LABS_API_KEY,
          length: process.env.TWELVE_LABS_API_KEY?.length
        }
      }, { status: 500 })
    }

    // Test with different endpoints
    const tests = [
      { name: 'List Indexes', endpoint: '/indexes?page_limit=1' },
      { name: 'Account Info', endpoint: '/account' },
      { name: 'Models', endpoint: '/models' }
    ]

    const results = []

    for (const test of tests) {
      console.log(`Testing: ${test.name}`)
      
      try {
        const res = await fetch(`${TWELVELABS_BASE}${test.endpoint}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        })

        const result: any = {
          name: test.name,
          endpoint: test.endpoint,
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          success: res.ok
        }

        if (res.ok) {
          result.data = await res.json()
        } else {
          result.error = await res.text()
        }

        results.push(result)
        console.log(`${test.name} result:`, result)

      } catch (error) {
        const errorResult = {
          name: test.name,
          endpoint: test.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        }
        results.push(errorResult)
        console.log(`${test.name} error:`, errorResult)
      }
    }

    return NextResponse.json({
      success: true,
      apiKeyInfo: {
        exists: !!apiKey,
        startsWith: apiKey.substring(0, 10) + '...',
        length: apiKey.length
      },
      testResults: results
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
