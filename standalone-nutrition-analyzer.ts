// Standalone Nutrition Analyzer with GLM Flash Integration
// Analyzes conversations and extracts nutrition data for nutrition_tracking table

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GLM API configuration
const GLM_API_KEY = process.env.GLM_API_KEY!;
const GLM_API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface NutritionTrackingEntry {
  calories_consumed?: number;
  calories_required?: number;
  protein_consumed?: number;
  protein_required?: number;
  carbs_consumed?: number;
  carbs_required?: number;
  fat_consumed?: number;
  fat_required?: number;
}

/**
 * Professional system prompt for nutrition analysis
 * Supports both English and Arabic languages
 */
const NUTRITION_ANALYSIS_SYSTEM_PROMPT = `You are an expert nutritionist and dietary analyst specializing in extracting structured nutrition data from conversations. Your task is to analyze the conversation between a user and AI coach and identify any nutrition-related changes, goals, or specific food intake.

**Your Responsibilities:**

1. **Identify Nutrition Changes:**
   - New calorie goals or targets
   - Changes in macronutrient requirements (protein, carbs, fat)
   - Specific food intake and nutritional values
   - Diet plan modifications
   - Meal timing changes
   - Supplement additions or changes

2. **Extract Structured Data:**
   For each nutrition change, extract:
   - calories_consumed: Actual calories consumed (number)
   - calories_required: Target calories (number)
   - protein_consumed: Actual protein in grams (number)
   - protein_required: Target protein in grams (number)
   - carbs_consumed: Actual carbohydrates in grams (number)
   - carbs_required: Target carbohydrates in grams (number)
   - fat_consumed: Actual fat in grams (number)
   - fat_required: Target fat in grams (number)

3. **Handle Multiple Languages:**
   - English: "calories", "protein", "carbs", "fat", "macros", "diet"
   - Arabic: "سعرات", "سعرة", "كالوري", "بروتين", "كربوهيدرات", "دهون", "غذاء", "تغذية"
   - Food names in both languages
   - Mixed language conversations

4. **Nutrient Calculation Guidelines:**
   - Protein: 4 calories per gram
   - Carbohydrates: 4 calories per gram
   - Fat: 9 calories per gram
   - Use standard nutritional values when specific values aren't mentioned
   - Estimate portion sizes based on common servings

5. **Output Format:**
   Return a JSON object with nutrition data. If no nutrition changes are detected, return an empty object.
   
   Format:
   \`\`\`json
   {
     "calories_consumed": 500,
     "calories_required": 2000,
     "protein_consumed": 30,
     "protein_required": 150,
     "carbs_consumed": 60,
     "carbs_required": 250,
     "fat_consumed": 15,
     "fat_required": 65
   }
   \`\`\`

6. **Detection Criteria:**
   - Look for phrases like: "eat", "calories", "protein", "carbs", "fat", "diet", "nutrition"
   - Arabic equivalents: "أكل", "سعرات", "بروتين", "كربوهيدرات", "دهون", "غذاء", "تغذية", "حمية"
   - Specific food mentions with quantities
   - Goal setting (e.g., "I want to eat 2000 calories")
   - Meal descriptions and nutritional content

7. **Important Rules:**
   - Only extract actual nutrition data, not general advice
   - Be conservative with estimates - if uncertain, don't extract
   - Use reasonable defaults based on common nutritional values
   - Handle both metric and imperial units
   - Consider context (weight loss, muscle gain, maintenance)

8. **Common Food Values (for estimation):**
   - Chicken breast (100g): ~165 calories, 31g protein, 0g carbs, 3.6g fat
   - Rice (1 cup cooked): ~216 calories, 4.5g protein, 45g carbs, 1.8g fat
   - Eggs (2 large): ~155 calories, 12g protein, 1g carbs, 11g fat
   - Banana (1 medium): ~105 calories, 1.3g protein, 27g carbs, 0.4g fat
   - الدجاج (100جم): ~165 سعرة, 31جم بروتين, 0جم كربوهيدرات, 3.6جم دهون

**Examples:**

Input: "I ate 2 chicken breasts and rice for lunch, about 600 calories total"
Output: {"calories_consumed": 600, "protein_consumed": 62, "carbs_consumed": 90, "fat_consumed": 7}

Input: "أريد أن أتناول 2000 سعرة حرارية يومياً مع 150جم بروتين"
Output: {"calories_required": 2000, "protein_required": 150}

Input: "My goal is 2500 calories, 200g protein, 250g carbs, 80g fat"
Output: {"calories_required": 2500, "protein_required": 200, "carbs_required": 250, "fat_required": 80}

If no nutrition data is mentioned, return: {}`;

/**
 * Call GLM Flash API for nutrition analysis
 */
async function callNutritionGLMAPI(messages: GLMMessage[]): Promise<NutritionTrackingEntry> {
  const headers = {
    "Authorization": `Bearer ${GLM_API_KEY}`,
    "Content-Type": "application/json"
  };

  const payload = {
    model: "glm-4-flash",
    messages: messages,
    stream: false
  };

  try {
    console.log('🚀 Making GLM Flash nutrition analysis request...');
    
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GLM API Error: ${response.status} ${response.statusText}`);
      throw new Error(`GLM API Error: ${response.status} - ${response.statusText}`);
    }

    const result: GLMResponse = await response.json();
    const answer = result.choices[0]?.message?.content?.trim();
    
    if (!answer) {
      console.error('❌ Empty response from GLM API');
      return {};
    }

    console.log(`✅ GLM nutrition analysis response received`);

    // Parse JSON response
    try {
      // Clean the response to extract JSON
      const jsonMatch = answer.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response, returning empty object');
        return {};
      }

      const nutritionData = JSON.parse(jsonMatch[0]);
      console.log(`✅ Parsed nutrition data with ${Object.keys(nutritionData).length} fields`);
      return nutritionData;

    } catch (parseError) {
      console.error('❌ Error parsing nutrition JSON:', parseError);
      console.error('📄 Raw response:', answer);
      return {};
    }

  } catch (error) {
    console.error('❌ GLM API Error in nutrition analysis:', error);
    return {};
  }
}

/**
 * Save nutrition tracking entry to database
 */
async function saveNutritionTrackingEntry(
  userId: string, 
  entry: NutritionTrackingEntry
): Promise<boolean> {
  try {
    if (!entry || Object.keys(entry).length === 0) {
      console.log('📭 No nutrition data to save');
      return true;
    }

    console.log(`💾 Saving nutrition entry for user: ${userId}`);

    // Add user_id and timestamp to entry
    const entryToSave = {
      ...entry,
      user_id: userId,
      timestamp: new Date().toISOString()
    };

    // Insert entry into nutrition_tracking table
    const { data, error } = await supabase
      .from('nutrition_tracking')
      .insert([entryToSave])
      .select();

    if (error) {
      console.error('❌ Error saving nutrition entry:', error);
      return false;
    }

    console.log(`✅ Successfully saved nutrition entry`);
    return true;

  } catch (error) {
    console.error('❌ Unexpected error in saveNutritionTrackingEntry:', error);
    return false;
  }
}

/**
 * Analyze conversation and extract nutrition data
 * @param userContent - Last user message
 * @param assistantContent - Last assistant message
 * @param userId - Internal user ID
 * @returns Promise<boolean> - Success status
 */
export async function analyzeAndSaveNutritionChanges(
  userContent: string,
  assistantContent: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('🥗 Analyzing conversation for nutrition data...');

    // Prepare conversation for analysis
    const conversationText = `User: ${userContent}\n\nAssistant: ${assistantContent}`;

    const messages: GLMMessage[] = [
      { role: "system", content: NUTRITION_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this conversation for nutrition data:\n\n${conversationText}` }
    ];

    // Get nutrition data from GLM
    const nutritionEntry = await callNutritionGLMAPI(messages);

    if (!nutritionEntry || Object.keys(nutritionEntry).length === 0) {
      console.log('📭 No nutrition data detected');
      return true; // Success, but no data
    }

    console.log(`🎯 Detected nutrition data with ${Object.keys(nutritionEntry).length} fields`);

    // Validate nutrition entry
    const validatedEntry = validateNutritionEntry(nutritionEntry);
    
    // Save to database
    const saveResult = await saveNutritionTrackingEntry(userId, validatedEntry);
    
    return saveResult;

  } catch (error) {
    console.error('❌ Error in analyzeAndSaveNutritionChanges:', error);
    return false;
  }
}

/**
 * Analyze multiple messages for nutrition data
 * @param messages - Array of recent messages
 * @param userId - Internal user ID
 * @returns Promise<boolean> - Success status
 */
export async function analyzeNutritionChangesFromMessages(
  messages: Array<{ role: string; content: string }>,
  userId: string
): Promise<boolean> {
  try {
    console.log('🥗 Analyzing multiple messages for nutrition data...');

    if (!messages || messages.length === 0) {
      console.log('📭 No messages to analyze');
      return true;
    }

    // Format messages for analysis
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const glmMessages: GLMMessage[] = [
      { role: "system", content: NUTRITION_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this conversation for nutrition data:\n\n${conversationText}` }
    ];

    // Get nutrition data from GLM
    const nutritionEntry = await callNutritionGLMAPI(glmMessages);

    if (!nutritionEntry || Object.keys(nutritionEntry).length === 0) {
      console.log('📭 No nutrition data detected in multiple messages');
      return true;
    }

    console.log(`🎯 Detected nutrition data with ${Object.keys(nutritionEntry).length} fields from multiple messages`);

    // Validate nutrition entry
    const validatedEntry = validateNutritionEntry(nutritionEntry);
    
    // Save to database
    const saveResult = await saveNutritionTrackingEntry(userId, validatedEntry);
    
    return saveResult;

  } catch (error) {
    console.error('❌ Error in analyzeNutritionChangesFromMessages:', error);
    return false;
  }
}

/**
 * Validate and clean nutrition entry data
 */
function validateNutritionEntry(entry: NutritionTrackingEntry): NutritionTrackingEntry {
  const validated: NutritionTrackingEntry = {};

  // Validate each field and ensure reasonable ranges
  if (entry.calories_consumed !== undefined && entry.calories_consumed >= 0 && entry.calories_consumed <= 10000) {
    validated.calories_consumed = entry.calories_consumed;
  }

  if (entry.calories_required !== undefined && entry.calories_required >= 0 && entry.calories_required <= 10000) {
    validated.calories_required = entry.calories_required;
  }

  if (entry.protein_consumed !== undefined && entry.protein_consumed >= 0 && entry.protein_consumed <= 1000) {
    validated.protein_consumed = entry.protein_consumed;
  }

  if (entry.protein_required !== undefined && entry.protein_required >= 0 && entry.protein_required <= 1000) {
    validated.protein_required = entry.protein_required;
  }

  if (entry.carbs_consumed !== undefined && entry.carbs_consumed >= 0 && entry.carbs_consumed <= 2000) {
    validated.carbs_consumed = entry.carbs_consumed;
  }

  if (entry.carbs_required !== undefined && entry.carbs_required >= 0 && entry.carbs_required <= 2000) {
    validated.carbs_required = entry.carbs_required;
  }

  if (entry.fat_consumed !== undefined && entry.fat_consumed >= 0 && entry.fat_consumed <= 1000) {
    validated.fat_consumed = entry.fat_consumed;
  }

  if (entry.fat_required !== undefined && entry.fat_required >= 0 && entry.fat_required <= 1000) {
    validated.fat_required = entry.fat_required;
  }

  return validated;
}

/**
 * Calculate total calories from macros (for validation)
 */
export function calculateCaloriesFromMacros(entry: NutritionTrackingEntry): number {
  let calories = 0;
  
  if (entry.protein_consumed) calories += entry.protein_consumed * 4;
  if (entry.carbs_consumed) calories += entry.carbs_consumed * 4;
  if (entry.fat_consumed) calories += entry.fat_consumed * 9;
  
  return calories;
}
