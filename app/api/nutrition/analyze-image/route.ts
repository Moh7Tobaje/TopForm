import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const imageUrl = formData.get('imageUrl') as string

    if (!image && !imageUrl) {
      return NextResponse.json({ error: 'No image or image URL provided' }, { status: 400 })
    }

    let imageBase64 = ''

    if (image) {
      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      imageBase64 = buffer.toString('base64')
    } else if (imageUrl) {
      // For URL, we'll pass the URL directly to the AI
      imageBase64 = imageUrl
    }

    const userPrompt = imageBase64.startsWith('http') 
      ? [
          {
            "type": "text",
            "text": "Analyze this meal from the provided image URL and return nutritional information in this exact JSON format:\n\n{\n  \"mealName\": \"meal name\",\n  \"totalCalories\": number,\n  \"protein\": number,\n  \"carbs\": number,\n  \"fat\": number,\n  \"ingredients\": [\n    {\n      \"name\": \"ingredient name\",\n      \"calories\": number,\n      \"quantity\": \"quantity with unit\"\n    }\n  ]\n}\n\nRequirements:\n- Use accurate nutritional databases\n- Calculate calories: (protein × 4) + (carbs × 4) + (fat × 9)\n- Be precise with portion sizes\n- Include all visible ingredients\n- Return JSON only"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageBase64
            }
          }
        ]
      : [
          {
            "type": "text",
            "text": "Analyze this meal from the provided image and return nutritional information in this exact JSON format:\n\n{\n  \"mealName\": \"meal name\",\n  \"totalCalories\": number,\n  \"protein\": number,\n  \"carbs\": number,\n  \"fat\": number,\n  \"ingredients\": [\n    {\n      \"name\": \"ingredient name\",\n      \"calories\": number,\n      \"quantity\": \"quantity with unit\"\n    }\n  ]\n}\n\nRequirements:\n- Use accurate nutritional databases\n- Calculate calories: (protein × 4) + (carbs × 4) + (fat × 9)\n- Be precise with portion sizes\n- Include all visible ingredients\n- Return JSON only"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = data.choices[0]?.message?.content || 'No analysis available'

    // Try to parse JSON response
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysis)
    } catch (e) {
      console.error('Failed to parse JSON response:', analysis)
      // Fallback: try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from API')
      }
    }

    return NextResponse.json({ 
      success: true, 
      analysis: parsedAnalysis,
      fileName: image?.name || 'URL image'
    })

  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    )
  }
}
