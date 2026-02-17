const GOOGLE_API_KEY = process.env.GOOG_API_KEY

if (!GOOGLE_API_KEY) {
  console.warn(
    '[google-embeddings] Missing GOOG_API_KEY environment variable. ' +
      'Embeddings-based memory will be disabled.'
  )
}

const EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`

/**
 * Get a 3072‑dimensional embedding vector for the given text using
 * Google Generative Language API (gemini-embedding-001).
 *
 * NOTE: Make sure to set the GOOG_API_KEY environment variable on the server.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!GOOGLE_API_KEY) {
    // Fail soft – caller should handle null and skip RAG in this case
    return null
  }

  const trimmed = text.trim()
  if (!trimmed) {
    return null
  }

  try {
    const res = await fetch(`${EMBEDDING_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        content: {
          parts: [{ text: trimmed }],
        },
      }),
    })

    if (!res.ok) {
      console.error(
        '[google-embeddings] HTTP error',
        res.status,
        await res.text().catch(() => '')
      )
      return null
    }

    const json = await res.json()
    const values: number[] | undefined =
      json?.embedding?.values || json?.embedding?.[0]?.values || json?.embeddings?.[0]?.values

    if (!values || !Array.isArray(values)) {
      console.error('[google-embeddings] Unexpected response shape', json)
      return null
    }

    return values
  } catch (err) {
    console.error('[google-embeddings] Failed to fetch embedding:', err)
    return null
  }
}


