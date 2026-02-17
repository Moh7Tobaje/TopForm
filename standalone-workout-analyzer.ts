// Standalone Workout Analyzer with GLM Flash Integration
// Analyzes conversations and extracts workout plan changes for workout_tracking table

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

interface WorkoutTrackingEntry {
  workout_day_name: string;
  exercise_name: string;
  required_sets?: number;
  required_reps?: number;
  required_weight?: string;
  suggested_rest_time?: number;
  completed_sets?: number;
  completed_reps?: number;
  completed_weight?: string;
  actual_rest_time?: number;
  perceived_effort?: number;
  form_quality?: number;
  notes?: string;
  workout_date?: string;
}

/**
 * Professional system prompt for workout analysis
 * Supports both English and Arabic languages
 */
const WORKOUT_ANALYSIS_SYSTEM_PROMPT = `You are an expert fitness coach and workout plan analyst specializing in extracting structured workout data from conversations. Your task is to analyze the conversation between a user and AI coach and identify any changes to workout plans, new exercises, or modifications to existing routines.

**Your Responsibilities:**

1. **Identify Workout Changes:**
   - New workout plans or routines
   - Modifications to existing exercises (sets, reps, weight)
   - New exercises added to the routine
   - Changes in workout schedule or frequency
   - Rest time modifications
   - Special instructions or notes for exercises

2. **Extract Structured Data:**
   For each identified workout change, extract:
   - workout_day_name: Name of the workout day (e.g., "Monday", "Upper Body", "Leg Day", "يوم الاثنين", "تمارين الجزء العلوي")
   - exercise_name: Specific exercise name (e.g., "Squats", "Bench Press", "القرفصاء", "بنش برس")
   - required_sets: Number of sets planned
   - required_reps: Number of repetitions per set
   - required_weight: Weight to be used (e.g., "50kg", "120lb", "bodyweight")
   - suggested_rest_time: Rest time in seconds between sets
   - notes: Any special instructions or form cues

3. **Handle Multiple Languages:**
   - English: "Squats", "Bench Press", "Deadlifts", "Push-ups"
   - Arabic: "القرفصاء", "بنش برس", "الدفليفت", "ضغط"
   - Mixed language conversations
   - Exercise variations and modifications

4. **Output Format:**
   Return a JSON array of workout changes. If no workout changes are detected, return an empty array.
   
   Format:
   \`\`\`json
   [
     {
       "workout_day_name": "Monday",
       "exercise_name": "Squats",
       "required_sets": 4,
       "required_reps": 10,
       "required_weight": "bodyweight",
       "suggested_rest_time": 90,
       "notes": "Focus on depth and form"
     }
   ]
   \`\`\`

5. **Detection Criteria:**
   - Look for phrases like: "new workout", "change to", "add exercise", "increase weight", "more reps"
   - Arabic equivalents: "تمرين جديد", "تغيير", "إضافة تمرين", "زيادة الوزن", "تكرارات أكثر"
   - Specific exercise instructions or modifications
   - Schedule changes (e.g., "Move leg day to Tuesday")

6. **Important Rules:**
   - Only extract actual workout changes, not general fitness advice
   - Be conservative - if uncertain, don't extract
   - Use reasonable defaults for missing values
   - Handle both metric (kg) and imperial (lb) units
   - Include the current date for workout_date if applicable

**Examples:**

Input: "I want to add deadlifts to my Monday workout, 3 sets of 5 reps at 100kg"
Output: [{"workout_day_name": "Monday", "exercise_name": "Deadlifts", "required_sets": 3, "required_reps": 5, "required_weight": "100kg"}]

Input: "أريد تغيير تمارين يوم الثلاثاء، إضافة تمارين الضغط 4 مجموعات من 12 تكرار"
Output: [{"workout_day_name": "Tuesday", "exercise_name": "Push-ups", "required_sets": 4, "required_reps": 12}]

If no workout changes are mentioned, return: []`;

/**
 * Call GLM Flash API for workout analysis
 */
async function callWorkoutGLMAPI(messages: GLMMessage[]): Promise<WorkoutTrackingEntry[]> {
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
    console.log('🚀 Making GLM Flash workout analysis request...');
    
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
      return [];
    }

    console.log(`✅ GLM workout analysis response received`);

    // Parse JSON response
    try {
      // Clean the response to extract JSON
      const jsonMatch = answer.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response, returning empty array');
        return [];
      }

      const workoutData = JSON.parse(jsonMatch[0]);
      console.log(`✅ Parsed ${workoutData.length} workout entries`);
      return workoutData;

    } catch (parseError) {
      console.error('❌ Error parsing workout JSON:', parseError);
      console.error('📄 Raw response:', answer);
      return [];
    }

  } catch (error) {
    console.error('❌ GLM API Error in workout analysis:', error);
    return [];
  }
}

/**
 * Save workout tracking entries to database
 */
async function saveWorkoutTrackingEntries(
  userId: string, 
  entries: WorkoutTrackingEntry[]
): Promise<boolean> {
  try {
    if (!entries || entries.length === 0) {
      console.log('📭 No workout entries to save');
      return true;
    }

    console.log(`💾 Saving ${entries.length} workout entries for user: ${userId}`);

    // Add user_id and current date to entries
    const entriesToSave = entries.map(entry => ({
      ...entry,
      user_id: userId,
      workout_date: entry.workout_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert entries into workout_tracking table
    const { data, error } = await supabase
      .from('workout_tracking')
      .upsert(entriesToSave, {
        onConflict: 'user_id,workout_day_name,exercise_name,workout_date',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('❌ Error saving workout entries:', error);
      return false;
    }

    console.log(`✅ Successfully saved ${data?.length || 0} workout entries`);
    return true;

  } catch (error) {
    console.error('❌ Unexpected error in saveWorkoutTrackingEntries:', error);
    return false;
  }
}

/**
 * Analyze conversation and extract workout changes
 * @param userContent - Last user message
 * @param assistantContent - Last assistant message
 * @param userId - Internal user ID
 * @returns Promise<boolean> - Success status
 */
export async function analyzeAndSaveWorkoutChanges(
  userContent: string,
  assistantContent: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('🏋️ Analyzing conversation for workout changes...');

    // Prepare conversation for analysis
    const conversationText = `User: ${userContent}\n\nAssistant: ${assistantContent}`;

    const messages: GLMMessage[] = [
      { role: "system", content: WORKOUT_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this conversation for workout plan changes:\n\n${conversationText}` }
    ];

    // Get workout changes from GLM
    const workoutEntries = await callWorkoutGLMAPI(messages);

    if (!workoutEntries || workoutEntries.length === 0) {
      console.log('📭 No workout changes detected');
      return true; // Success, but no changes
    }

    console.log(`🎯 Detected ${workoutEntries.length} workout changes`);

    // Save to database
    const saveResult = await saveWorkoutTrackingEntries(userId, workoutEntries);
    
    return saveResult;

  } catch (error) {
    console.error('❌ Error in analyzeAndSaveWorkoutChanges:', error);
    return false;
  }
}

/**
 * Analyze multiple messages for workout changes
 * @param messages - Array of recent messages
 * @param userId - Internal user ID
 * @returns Promise<boolean> - Success status
 */
export async function analyzeWorkoutChangesFromMessages(
  messages: Array<{ role: string; content: string }>,
  userId: string
): Promise<boolean> {
  try {
    console.log('🏋️ Analyzing multiple messages for workout changes...');

    if (!messages || messages.length === 0) {
      console.log('📭 No messages to analyze');
      return true;
    }

    // Format messages for analysis
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const glmMessages: GLMMessage[] = [
      { role: "system", content: WORKOUT_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this conversation for workout plan changes:\n\n${conversationText}` }
    ];

    // Get workout changes from GLM
    const workoutEntries = await callWorkoutGLMAPI(glmMessages);

    if (!workoutEntries || workoutEntries.length === 0) {
      console.log('📭 No workout changes detected in multiple messages');
      return true;
    }

    console.log(`🎯 Detected ${workoutEntries.length} workout changes from multiple messages`);

    // Save to database
    const saveResult = await saveWorkoutTrackingEntries(userId, workoutEntries);
    
    return saveResult;

  } catch (error) {
    console.error('❌ Error in analyzeWorkoutChangesFromMessages:', error);
    return false;
  }
}

/**
 * Validate workout entry data
 */
export function validateWorkoutEntry(entry: WorkoutTrackingEntry): boolean {
  if (!entry.workout_day_name || !entry.exercise_name) {
    return false;
  }

  if (entry.required_sets && (entry.required_sets < 0 || entry.required_sets > 100)) {
    return false;
  }

  if (entry.required_reps && (entry.required_reps < 0 || entry.required_reps > 1000)) {
    return false;
  }

  if (entry.suggested_rest_time && (entry.suggested_rest_time < 0 || entry.suggested_rest_time > 3600)) {
    return false;
  }

  return true;
}
