import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

interface Exercise {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles?: string[]
  bodyParts?: string[]
  equipments?: string[]
  secondaryMuscles?: string[]
  instructions?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const filePath = path.resolve(process.cwd(), 'exercises.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const allExercises: Exercise[] = JSON.parse(fileContent)

    const textLower = text.toLowerCase()

    // Match exercises whose name appears in the text (case-insensitive)
    const matches: Exercise[] = []
    for (const ex of allExercises) {
      const nameLower = ex.name.toLowerCase()
      if (textLower.includes(nameLower)) {
        matches.push(ex)
        if (matches.length >= 25) break // safety cap
      }
    }

    const results = matches.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      gifUrl: ex.gifUrl,
      targetMuscles: ex.targetMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      instructions: ex.instructions || [],
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Exercise search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
