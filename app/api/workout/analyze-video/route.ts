import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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
  if (body && typeof body === 'string') headers['Content-Type'] = 'application/json'
  // do not set Content-Type for FormData; fetch will set multipart boundary
  const res = await fetch(url, { method, headers, body: body || undefined })
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = process.env.TWELVE_LABS_API_KEY
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ error: 'Twelve Labs API key not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const videoUrlRaw = formData.get('video_url') as string | null
    const videoUrl = typeof videoUrlRaw === 'string' ? videoUrlRaw.trim() : ''
    const useUrl = /^https?:\/\/.+\..+/.test(videoUrl)

    const indexId = await getOrCreateIndex(apiKey)

    let taskRes: Response
    if (useUrl) {
      // Large videos: Twelve Labs fetches from URL (no body size limit on our side)
      const uploadForm = new FormData()
      uploadForm.append('index_id', indexId)
      uploadForm.append('video_url', videoUrl)
      taskRes = await twelvelabsFetch('/tasks', apiKey, { method: 'POST', body: uploadForm })
    } else {
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
      uploadForm.append('index_id', indexId)
      uploadForm.append('video_file', blob, fileName)
      taskRes = await twelvelabsFetch('/tasks', apiKey, { method: 'POST', body: uploadForm })
    }
    if (!taskRes.ok) {
      const t = await taskRes.text()
      return NextResponse.json(
        { error: `Twelve Labs upload failed: ${taskRes.status}`, details: t },
        { status: 502 }
      )
    }
    const taskData = (await taskRes.json()) as { _id?: string; video_id?: string; asset_id?: string; video?: string; status?: string }
    const taskId = taskData._id
    if (!taskId) {
      return NextResponse.json({ error: 'Twelve Labs: no task id in response' }, { status: 502 })
    }

    let videoId: string | undefined = taskData.video_id || taskData.asset_id || (typeof taskData.video === 'string' ? taskData.video : undefined)
    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      const statusRes = await twelvelabsFetch(`/tasks/${taskId}`, apiKey)
      if (!statusRes.ok) continue
      const statusData = (await statusRes.json()) as { status?: string; video_id?: string; asset_id?: string; video?: string }
      if (statusData.video_id) videoId = statusData.video_id
      else if (statusData.asset_id) videoId = statusData.asset_id
      else if (typeof statusData.video === 'string') videoId = statusData.video
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

    const prompt = `You are an expert fitness coach. Analyze this video of an exercise performance in detail.

Provide:
1) Form and technique – what is correct and what needs improvement.
2) Specific cues to fix any issues.
3) Safety considerations.
4) Tips to optimize the movement.

Be concise and actionable. If the video or context suggests the user prefers Arabic, respond in Arabic; otherwise use English.`

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

    const analyzeText = await analyzeRes.text()
    if (!analyzeRes.ok) {
      let errMsg = `Analysis failed (${analyzeRes.status})`
      try {
        const errJson = JSON.parse(analyzeText) as { message?: string; code?: string; error?: string }
        const msg = errJson.message || errJson.error || errJson.code
        if (msg) errMsg = String(msg)
        if (errJson.code === 'index_not_supported_for_generate') {
          errMsg = 'This index does not support analysis. It must use a Pegasus engine.'
        } else if (errJson.code === 'token_limit_exceeded' || /token_limit/i.test(String(msg))) {
          errMsg = 'Video too long. Try a shorter clip (under 1 minute).'
        }
      } catch {
        if (analyzeText) errMsg = analyzeText.slice(0, 200)
      }
      return NextResponse.json({ error: errMsg }, { status: analyzeRes.status >= 400 && analyzeRes.status < 500 ? analyzeRes.status : 502 })
    }

    const gen = (() => {
      try {
        return JSON.parse(analyzeText) as Record<string, unknown>
      } catch {
        return {}
      }
    })()

    // /v1.3/analyze non‑stream: { data: string, id, finish_reason, usage }
    let analysis = ''
    if (typeof gen.data === 'string') {
      analysis = gen.data
    } else if (gen.data && typeof gen.data === 'object' && gen.data !== null) {
      const d = gen.data as Record<string, unknown>
      analysis = (typeof d.generated_text === 'string' ? d.generated_text : '') || (typeof d.text === 'string' ? d.text : '')
    }
    if (!analysis) {
      analysis = (typeof gen.generated_text === 'string' ? gen.generated_text : '') || (typeof gen.text === 'string' ? gen.text : '') || (typeof gen.summary === 'string' ? gen.summary : '')
    }

    return NextResponse.json({ analysis: analysis.trim() || 'No analysis could be generated.' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown'
    console.error('analyze-video error:', e)
    return NextResponse.json(
      { error: `Internal error: ${msg}` },
      { status: 500 }
    )
  }
}
