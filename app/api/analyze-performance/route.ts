import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import fs from 'fs'
import { processAnalysisWithGLM } from '../../../lib/performance-processor'

const TWELVELABS_BASE = process.env.TWELVELABS_API_URL || 'https://api.twelvelabs.io/v1.3'
const INDEX_NAME = process.env.TWELVELABS_INDEX_NAME || 'topcoach-analysis'
const POLL_INTERVAL_MS = 3000
const POLL_MAX_ATTEMPTS = 60 // ~3 min

async function twelvelabsFetch(
  path: string,
  apiKey: string,
  opts: { method?: string; body?: FormData | string; headers?: Record<string, string> } = {}
) {
  const { method = 'GET', body, headers = {} } = opts
  const url = `${TWELVELABS_BASE}${path}`
  
  // Use x-api-key header instead of Authorization
  const defaultHeaders: Record<string, string> = {
    'x-api-key': apiKey,
    ...headers
  }
  
  if (body && typeof body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json'
  }
  
  // do not set Content-Type for FormData; fetch will set multipart boundary
  const res = await fetch(url, { method, headers: defaultHeaders, body: body || undefined })
  return res
}

async function getOrCreateIndex(apiKey: string): Promise<string> {
  const listRes = await twelvelabsFetch('/indexes?page_limit=10', apiKey)
  if (!listRes.ok) {
    const t = await listRes.text()
    throw new Error(`Twelve Labs list indexes failed: ${listRes.status} ${t}`)
  }
  const list = (await listRes.json()) as { data?: Array<{ _id?: string; name?: string; index_name?: string }> }
  const arr = Array.isArray(list.data) ? list.data : []
  const found = arr.find((i) => (i.index_name || i.name || '') === INDEX_NAME)
  if (found && found._id) return found._id

  const createRes = await twelvelabsFetch('/indexes', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      index_name: INDEX_NAME,
      models: [{ model_name: 'pegasus1.2', model_options: ['visual', 'audio'] }],
    }),
  })
  if (!createRes.ok) {
    const t = await createRes.text()
    throw new Error(`Twelve Labs create index failed: ${createRes.status} ${t}`)
  }
  const created = (await createRes.json()) as { _id?: string }
  if (!created._id) throw new Error('Twelve Labs create index: no _id')
  return created._id
}

async function createAsset(apiKey: string, videoUrl: string): Promise<string> {
  const uploadForm = new FormData()
  uploadForm.append('index_id', await getOrCreateIndex(apiKey))
  uploadForm.append('video_url', videoUrl)
  
  const taskRes = await twelvelabsFetch('/tasks', apiKey, { 
    method: 'POST', 
    body: uploadForm 
  })
  
  if (!taskRes.ok) {
    const t = await taskRes.text()
    throw new Error(`Twelve Labs upload failed: ${taskRes.status} ${t}`)
  }
  
  const taskData = (await taskRes.json()) as { _id?: string; video_id?: string; asset_id?: string }
  const taskId = taskData._id
  if (!taskId) {
    throw new Error('Twelve Labs: no task id in response')
  }
  
  // Wait for processing
  let videoId: string | undefined
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    const statusRes = await twelvelabsFetch(`/tasks/${taskId}`, apiKey)
    if (!statusRes.ok) continue
    
    const statusData = (await statusRes.json()) as { status?: string; video_id?: string; asset_id?: string }
    if (statusData.video_id) videoId = statusData.video_id
    else if (statusData.asset_id) videoId = statusData.asset_id
    
    if (statusData.status === 'ready') break
    if (statusData.status === 'failed') {
      throw new Error('Video processing failed. Try a shorter or clearer video.')
    }
  }
  
  if (!videoId) {
    throw new Error('Video processing timed out. Try a shorter video.')
  }
  
  return videoId
}

async function analyzeVideo(apiKey: string, videoId: string): Promise<string> {
  // Read the new system prompt from file
  let prompt: string
  try {
    const promptPath = join(process.cwd(), 'prompt.txt')
    prompt = await readFile(promptPath, 'utf8')
  } catch (error) {
    // Fallback prompt if file doesn't exist
    prompt = `You are an expert fitness coach. Analyze this video of an exercise performance in detail.

Provide:
1) Form and technique – what is correct and what needs improvement.
2) Specific cues to fix any issues.
3) Safety considerations.
4) Tips to optimize the movement.

Be concise and actionable. If the video or context suggests the user prefers Arabic, respond in Arabic; otherwise use English.`
  }

  const analyzeRes = await twelvelabsFetch('/analyze', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      video_id: videoId,
      prompt,
      stream: false,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!analyzeRes.ok) {
    const errorText = await analyzeRes.text()
    throw new Error(`Analysis failed: ${analyzeRes.status} ${errorText}`)
  }

  const result = await analyzeRes.json() as { data?: string }
  return result.data || 'No analysis could be generated.'
}

export async function POST(request: NextRequest) {
  try {
    // Debug logging
    console.log('=== Twelve Labs API Debug ===')
    console.log('API Key exists:', !!process.env.TWELVE_LABS_API_KEY)
    console.log('API Key starts with:', process.env.TWELVE_LABS_API_KEY?.substring(0, 10))
    console.log('API Key length:', process.env.TWELVE_LABS_API_KEY?.length)
    console.log('API URL:', TWELVELABS_BASE)
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.TWELVE_LABS_API_KEY
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ error: 'Twelve Labs API key not configured' }, { status: 500 })
    }

    // Test API key with a simple request first
    console.log('Testing API key...')
    const testRes = await fetch(`${TWELVELABS_BASE}/indexes?page_limit=1`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })
    
    console.log('Test response status:', testRes.status)
    console.log('Test response headers:', Object.fromEntries(testRes.headers.entries()))
    
    if (!testRes.ok) {
      const errorText = await testRes.text()
      console.log('Test error response:', errorText)
      return NextResponse.json({ 
        error: `API Key validation failed: ${testRes.status}`,
        details: errorText 
      }, { status: 401 })
    }

    const formData = await request.formData()
    const videoUrlRaw = formData.get('video_url') as string | null
    const videoUrl = typeof videoUrlRaw === 'string' ? videoUrlRaw.trim() : ''
    const useUrl = /^https?:\/\/.+\..+/.test(videoUrl)

    let videoId: string = ''

    if (useUrl) {
      // Handle URL upload
      if (!videoUrl) {
        return NextResponse.json({ error: 'No video URL provided' }, { status: 400 })
      }
      videoId = await createAsset(apiKey, videoUrl)
    } else {
      // Handle file upload
      const file = formData.get('video') as File | Blob | null
      if (!file || typeof (file as Blob).arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'No video file or URL provided' }, { status: 400 })
      }
      
      const fileSize = (file as Blob).size
      if (!fileSize) {
        return NextResponse.json({ error: 'Video file is empty' }, { status: 400 })
      }
      
      // Vercel serverless body limit 4.5MB; use 4.4MB to stay under
      const maxBytes = 4.4 * 1024 * 1024
      if (fileSize > maxBytes) {
        return NextResponse.json({
          error: `Video upload limit is 4.4 MB on Vercel. Use "Analyze from URL" below for larger files (e.g. link from Google Drive, Dropbox).`,
        }, { status: 400 })
      }
      
      if (fileSize > 2 * 1024 * 1024 * 1024) {
        return NextResponse.json({ error: 'Video must be under 2GB' }, { status: 400 })
      }

      const buf = await (file as Blob).arrayBuffer()
      const blob = new Blob([buf], { type: (file as Blob).type || 'video/webm' })
      const fileName = (file && 'name' in file && typeof (file as { name?: string }).name === 'string')
        ? (file as { name: string }).name
        : 'video.webm'

      const uploadForm = new FormData()
      uploadForm.append('index_id', await getOrCreateIndex(apiKey))
      uploadForm.append('video_file', blob, fileName)
      
      const taskRes = await twelvelabsFetch('/tasks', apiKey, { method: 'POST', body: uploadForm })
      if (!taskRes.ok) {
        const t = await taskRes.text()
        return NextResponse.json(
          { error: `Twelve Labs upload failed: ${taskRes.status}`, details: t },
          { status: 502 }
        )
      }
      
      const taskData = (await taskRes.json()) as { _id?: string; video_id?: string; asset_id?: string }
      const taskId = taskData._id
      if (!taskId) {
        return NextResponse.json({ error: 'Twelve Labs: no task id in response' }, { status: 502 })
      }

      // Wait for processing
      for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
        const statusRes = await twelvelabsFetch(`/tasks/${taskId}`, apiKey)
        if (!statusRes.ok) continue
        
        const statusData = (await statusRes.json()) as { status?: string; video_id?: string; asset_id?: string }
        if (statusData.video_id) videoId = statusData.video_id
        else if (statusData.asset_id) videoId = statusData.asset_id
        
        if (statusData.status === 'ready') break
        if (statusData.status === 'failed') {
          return NextResponse.json(
            { error: 'Video processing failed. Try a shorter or clearer video.' },
            { status: 422 }
          )
        }
      }
      
      if (!videoId) {
        return NextResponse.json(
          { error: 'Video processing timed out. Try a shorter video.' },
          { status: 504 }
        )
      }
    }

    // Analyze the video
    console.log('🎥 Starting video analysis...')
    const rawAnalysis = await analyzeVideo(apiKey, videoId)
    console.log('📝 Raw analysis received, processing with GLM...')
    
    // Process the analysis with GLM to get structured JSON
    const structuredResult = await processAnalysisWithGLM(rawAnalysis)
    console.log('✅ Analysis processed successfully with GLM')
    
    return NextResponse.json({ 
      analysis: structuredResult,
      rawAnalysis: rawAnalysis // Include raw analysis for debugging/reference
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown'
    console.error('analyze-video error:', e)
    return NextResponse.json(
      { error: `Internal error: ${msg}` },
      { status: 500 }
    )
  }
}
