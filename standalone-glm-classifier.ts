// Standalone GLM Flash Classifier for Workout vs Nutrition Detection
// This is a separate implementation from the main project's GLM API

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

// Environment variables
const GLM_API_KEY = process.env.GLM_API_KEY;
const GLM_API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

if (!GLM_API_KEY) {
  throw new Error('GLM_API_KEY environment variable is required');
}

/**
 * Professional system prompt for workout vs nutrition classification
 * Supports both English and Arabic languages
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert AI classifier specializing in fitness and nutrition content analysis. Your task is to analyze conversations between a user and an AI fitness coach and determine if the content is primarily about WORKOUT training or NUTRITION diet.

**Classification Rules:**

1. **WORKOUT** - Classify as "workout" if the conversation discusses:
   - Exercise routines, training programs, workout plans
   - Specific exercises (squats, deadlifts, push-ups, etc.)
   - Training schedules, gym sessions, fitness routines
   - Muscle groups, strength training, cardio exercises
   - Workout equipment, weights, reps, sets, training volume
   - Training frequency, workout duration, rest periods
   - Fitness goals related to exercise performance
   - Arabic equivalents: تمرين, تدريب, رياضة, تمارين, صالة الألعاب, عضلات, قوة, كارديو

2. **NUTRITION** - Classify as "nutrition" if the conversation discusses:
   - Food, meals, eating habits, dietary plans
   - Calories, macronutrients (protein, carbs, fats)
   - Supplements, vitamins, minerals
   - Diet plans, weight management through food
   - Meal timing, nutrition timing, pre/post workout meals
   - Specific foods, recipes, cooking methods
   - Hydration, water intake
   - Arabic equivalents: طعام, أكل, وجبة, سعرات حرارية, بروتين, كربوهيدرات, دهون, غذاء, تغذية, حمية, رجيم, دايت

3. **NEUTRAL/OTHER** - Classify as "0" if:
   - The conversation is about general fitness advice without specific workout or nutrition details
   - Greetings, general questions, administrative topics
   - Motivation, general health advice not specific to exercise or food
   - Technical issues, app functionality, account management

**Output Format:**
- Respond with ONLY one word: "workout", "nutrition", or "0"
- No additional text, explanations, or formatting
- Be decisive and choose the most dominant topic

**Language Support:**
- Analyze content in both English and Arabic
- Consider cultural context and terminology
- Handle mixed-language conversations appropriately

**Examples:**
- "I want to start going to the gym and build muscle" → "workout"
- "How many calories should I eat to lose weight?" → "nutrition"
- "Hello, how are you?" → "0"
- "أريد برنامج تمرين لبناء العضلات" → "workout"
- "كم عدد السعرات الحرارية في وجبة الدجاج؟" → "nutrition"`;

/**
 * Call GLM Flash API for classification
 */
async function callGLMFlashAPI(messages: GLMMessage[]): Promise<string> {
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
    console.log('🚀 Making GLM Flash classification request...');
    
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GLM API Error: ${response.status} ${response.statusText}`);
      console.error(`📄 Error details: ${errorText}`);
      throw new Error(`GLM API Error: ${response.status} - ${response.statusText}`);
    }

    const result: GLMResponse = await response.json();
    const answer = result.choices[0]?.message?.content?.trim().toLowerCase();
    
    if (!answer) {
      console.error('❌ Empty response from GLM API');
      throw new Error('Empty response from GLM API');
    }

    console.log(`✅ GLM classification result: ${answer}`);
    return answer;

  } catch (error) {
    console.error('❌ GLM API Error:', error);
    throw error;
  }
}

/**
 * Classify conversation content as workout, nutrition, or neutral
 * @param userContent - Last user message
 * @param assistantContent - Last assistant message  
 * @returns Promise<string> - "workout", "nutrition", or "0"
 */
export async function classifyConversationContent(
  userContent: string,
  assistantContent: string
): Promise<string> {
  try {
    console.log('🔍 Classifying conversation content...');

    // Prepare the conversation for analysis
    const conversationText = `User: ${userContent}\n\nAssistant: ${assistantContent}`;

    const messages: GLMMessage[] = [
      { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
      { role: "user", content: `Please classify this conversation:\n\n${conversationText}` }
    ];

    const result = await callGLMFlashAPI(messages);
    
    // Validate and normalize the result
    const validResults = ['workout', 'nutrition', '0'];
    if (!validResults.includes(result)) {
      console.warn(`⚠️ Unexpected classification result: ${result}. Defaulting to "0"`);
      return '0';
    }

    console.log(`✅ Classification successful: ${result}`);
    return result;

  } catch (error) {
    console.error('❌ Error in classifyConversationContent:', error);
    return '0'; // Default to neutral on error
  }
}

/**
 * Classify based on multiple recent messages for better context
 * @param messages - Array of recent messages
 * @returns Promise<string> - "workout", "nutrition", or "0"
 */
export async function classifyConversationFromMessages(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    console.log('🔍 Classifying conversation from multiple messages...');

    if (!messages || messages.length === 0) {
      console.log('📭 No messages to classify');
      return '0';
    }

    // Format messages for analysis
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const glmMessages: GLMMessage[] = [
      { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
      { role: "user", content: `Please classify this conversation:\n\n${conversationText}` }
    ];

    const result = await callGLMFlashAPI(glmMessages);
    
    // Validate and normalize the result
    const validResults = ['workout', 'nutrition', '0'];
    if (!validResults.includes(result)) {
      console.warn(`⚠️ Unexpected classification result: ${result}. Defaulting to "0"`);
      return '0';
    }

    console.log(`✅ Classification successful: ${result}`);
    return result;

  } catch (error) {
    console.error('❌ Error in classifyConversationFromMessages:', error);
    return '0'; // Default to neutral on error
  }
}

/**
 * Quick classification using keyword detection as fallback
 * @param content - Text content to analyze
 * @returns string - Quick classification result
 */
export function quickKeywordClassification(content: string): string {
  const workoutKeywords = [
    // English
    'workout', 'exercise', 'training', 'gym', 'fitness', 'squats', 'deadlifts', 
    'pushups', 'bench press', 'cardio', 'muscle', 'strength', 'reps', 'sets',
    'weights', 'lifting', 'routine', 'program', 'session',
    // Arabic
    'تمرين', 'تدريب', 'رياضة', 'صالة', 'عضلات', 'قوة', 'كارديو', 'تمارين',
    'جلسات', 'تكرارات', 'أوزان', 'رفع', 'روتين', 'برنامج'
  ];

  const nutritionKeywords = [
    // English
    'food', 'eat', 'meal', 'calories', 'protein', 'carbs', 'fat', 'diet',
    'nutrition', 'macros', 'supplement', 'vitamin', 'water', 'hydration',
    'cooking', 'recipe', 'breakfast', 'lunch', 'dinner', 'snack',
    // Arabic
    'طعام', 'أكل', 'وجبة', 'سعرات', 'سعرة', 'كالوري', 'بروتين', 'كربوهيدرات',
    'دهون', 'غذاء', 'تغذية', 'حمية', 'رجيم', 'دايت', 'فيتامين', 'ماء', 'طبخ'
  ];

  const lowerContent = content.toLowerCase();

  // Check workout keywords
  const workoutScore = workoutKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  ).length;

  // Check nutrition keywords  
  const nutritionScore = nutritionKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  ).length;

  if (workoutScore > nutritionScore) return 'workout';
  if (nutritionScore > workoutScore) return 'nutrition';
  return '0';
}
