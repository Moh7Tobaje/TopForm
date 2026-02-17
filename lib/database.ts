import { supabase } from './supabase'
import { GLMMessage } from './glm-api'

// Get or create user
export async function getOrCreateUser(clerkUserId: string, username?: string): Promise<string> {
  try {
    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError
    }

    if (existingUser) {
      return existingUser.user_id
    }

    // Create new user if doesn't exist
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        clerk_user_id: clerkUserId,
        username: username || `User_${clerkUserId.slice(0, 8)}`
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return newUser.user_id
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}

// Save message to database
export async function saveMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        role: role,
        content: content
      })
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error saving message:', error)
    return false
  }
}

// Get conversation history
export async function getConversationHistory(userId: string, limit?: number): Promise<GLMMessage[]> {
  try {
    let query = supabase
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const messages: GLMMessage[] = data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Return in chronological order
      if (limit) {
        return messages.reverse()
      }
      return messages
    }

    return []
  } catch (error) {
    console.error('Error getting conversation history:', error)
    return []
  }
}

// Get user message count
export async function getUserMessageCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("role", "user")

    if (error) {
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('Error getting user message count:', error)
    return 0
  }
}

// Save conversation with important info
export async function upsertConversation(userId: string, conversation: string, importantInfo: string): Promise<boolean> {
  try {
    // تحقق هل يوجد صف سابق لهذا المستخدم
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existing) {
      // حدّث الصف الموجود
      const { data, error } = await supabase
        .from('conversations')
        .update({
          conversation,
          important_info: importantInfo,
          date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return !!data
    } else {
      // أدخل صف جديد
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          conversation,
          important_info: importantInfo
        })
        .select()
        .single()

      if (error) throw error
      return !!data
    }
  } catch (error) {
    console.error('Error upserting conversation:', error)
    return false
  }
}

// Get latest important info
export async function getLatestImportantInfo(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("important_info")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw error
    }

    return data?.important_info || null
  } catch (error) {
    console.error('Error getting latest important info:', error)
    return null
  }
}

// Get username from user ID
export async function getUsername(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("user_id", userId)
      .single()

    if (error) {
      throw error
    }

    return data?.username || "Unknown"
  } catch (error) {
    console.error('Error getting username:', error)
    return "Unknown"
  }
}

// Get all conversation history for workout extraction (no limit)
export async function getAllConversationHistory(userId: string): Promise<GLMMessage[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true }) // Chronological order for extraction

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const messages: GLMMessage[] = data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      return messages
    }

    return []
  } catch (error) {
    console.error('Error getting all conversation history:', error)
    return []
  }
}

export async function getConversationHistoryBetween(userId: string, startIso: string, endIso: string): Promise<GLMMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startIso)
      .lte('timestamp', endIso)
      .order('timestamp', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      const messages: GLMMessage[] = data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
      return messages
    }
    return []
  } catch (error) {
    console.error('Error getting conversation history between dates:', error)
    return []
  }
}

// ====== RAG memory_store helpers (pgvector) ======

export interface MemoryRecord {
  id: number
  user_id: string
  content: string
  metadata: any | null
  created_at: string
  similarity?: number
}

/**
 * Insert a new memory chunk for a user.
 * Expects a 768‑dimensional embedding vector from text-embedding-004.
 */
/**
 * Insert a new memory chunk for a user with enhanced metadata.
 * This function automatically enriches metadata with additional context.
 */
export async function insertMemory(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    if (!content.trim() || !Array.isArray(embedding) || embedding.length === 0) {
      return
    }

    // Enrich metadata with additional information
    const enrichedMetadata = {
      ...metadata,
      content_length: content.length,
      content_preview: content.substring(0, 150), // First 150 chars for quick reference
      embedding_dimensions: embedding.length,
      inserted_at: new Date().toISOString(),
      version: '1.0' // For future compatibility
    }

    const { error } = await supabase.from('memory_store').insert({
      user_id: userId,
      content,
      embedding,
      metadata: enrichedMetadata,
    })

    if (error) {
      console.error('Error inserting memory_store row:', error)
    }
  } catch (err) {
    console.error('Unexpected error in insertMemory:', err)
  }
}

/**
 * Search the memory_store using a pgvector similarity function defined in SQL.
 *
 * This assumes a Postgres function like:
 *
 *   create or replace function match_memories(
 *     query_embedding vector(768),
 *     match_count int,
 *     user_id uuid,
 *     min_similarity float
 *   )
 *   returns table (
 *     id bigint,
 *     user_id uuid,
 *     content text,
 *     metadata jsonb,
 *     created_at timestamptz,
 *     similarity float
 *   )
 *   language sql stable as $$
 *   select
 *     m.id,
 *     m.user_id,
 *     m.content,
 *     m.metadata,
 *     m.created_at,
 *     1 - (m.embedding <=> query_embedding) as similarity
 *   from memory_store m
 *   where m.user_id = match_memories.user_id
 *     and 1 - (m.embedding <=> query_embedding) >= min_similarity
 *   order by m.embedding <=> query_embedding
 *   limit match_count;
 *   $$;
 */
export async function searchMemories(
  userId: string,
  embedding: number[],
  matchCount = 5,
  minSimilarity = 0.6
): Promise<MemoryRecord[]> {
  try {
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return []
    }

    // تحديث ترتيب المعاملات ليتوافق مع الدالة المعدلة
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      target_user_id: userId,
      min_similarity: minSimilarity,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error searching memories via match_memories RPC:', error)
      return []
    }

    // Sort by similarity (highest first) and ensure we have both user and assistant messages
    const results = (data || []) as MemoryRecord[]
    
    // Prioritize results: prefer pairs of user+assistant messages when possible
    const sortedResults = results.sort((a, b) => {
      const simA = a.similarity || 0
      const simB = b.similarity || 0
      return simB - simA // Higher similarity first
    })

    return sortedResults
  } catch (err) {
    console.error('Unexpected error in searchMemories:', err)
    return []
  }
}

// ====== Nutrition Tracking Functions ======

export async function insertNutritionTracking(
  userId: string,
  proteinConsumed: number = 0,
  proteinRequired: number = 0,
  carbsConsumed: number = 0,
  carbsRequired: number = 0,
  fatConsumed: number = 0,
  fatRequired: number = 0,
  caloriesConsumed: number = 0,
  caloriesRequired: number = 0
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("nutrition_tracking")
      .insert({
        user_id: userId,
        protein_consumed: proteinConsumed,
        protein_required: proteinRequired,
        carbs_consumed: carbsConsumed,
        carbs_required: carbsRequired,
        fat_consumed: fatConsumed,
        fat_required: fatRequired,
        calories_consumed: caloriesConsumed,
        calories_required: caloriesRequired
      })
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error inserting nutrition tracking:', error)
    return false
  }
}

export async function getTodayNutritionTracking(userId: string): Promise<any[]> {
  try {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from("nutrition_tracking")
      .select("*")
      .eq("user_id", userId)
      .gte("timestamp", startOfDay.toISOString())
      .lte("timestamp", endOfDay.toISOString())
      .order("timestamp", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting today nutrition tracking:', error)
    return []
  }
}

export async function getTodayNutritionTotals(userId: string): Promise<{
  caloriesConsumed: number;
  caloriesRequired: number;
  proteinConsumed: number;
  proteinRequired: number;
  carbsConsumed: number;
  carbsRequired: number;
  fatConsumed: number;
  fatRequired: number;
}> {
  try {
    const todayData = await getTodayNutritionTracking(userId)
    
    if (todayData.length === 0) {
      // If no data today, get the last non-zero required values from history
      const lastRequiredValues = await getLastNonZeroRequiredValues(userId)
      return {
        caloriesConsumed: 0,
        caloriesRequired: lastRequiredValues.caloriesRequired,
        proteinConsumed: 0,
        proteinRequired: lastRequiredValues.proteinRequired,
        carbsConsumed: 0,
        carbsRequired: lastRequiredValues.carbsRequired,
        fatConsumed: 0,
        fatRequired: lastRequiredValues.fatRequired
      }
    }

    // Sum up all consumed values and get the latest required values
    const totals = todayData.reduce((acc, record) => {
      acc.caloriesConsumed += Number(record.calories_consumed) || 0
      acc.proteinConsumed += Number(record.protein_consumed) || 0
      acc.carbsConsumed += Number(record.carbs_consumed) || 0
      acc.fatConsumed += Number(record.fat_consumed) || 0
      
      // Use the latest required values (from the most recent record)
      acc.caloriesRequired = Number(record.calories_required) || acc.caloriesRequired
      acc.proteinRequired = Number(record.protein_required) || acc.proteinRequired
      acc.carbsRequired = Number(record.carbs_required) || acc.carbsRequired
      acc.fatRequired = Number(record.fat_required) || acc.fatRequired
      
      return acc
    }, {
      caloriesConsumed: 0,
      caloriesRequired: 0,
      proteinConsumed: 0,
      proteinRequired: 0,
      carbsConsumed: 0,
      carbsRequired: 0,
      fatConsumed: 0,
      fatRequired: 0
    })

    // If today's required values are all 0, get the last non-zero values from history
    if (totals.caloriesRequired === 0 && totals.proteinRequired === 0 && totals.carbsRequired === 0 && totals.fatRequired === 0) {
      const lastRequiredValues = await getLastNonZeroRequiredValues(userId)
      totals.caloriesRequired = lastRequiredValues.caloriesRequired
      totals.proteinRequired = lastRequiredValues.proteinRequired
      totals.carbsRequired = lastRequiredValues.carbsRequired
      totals.fatRequired = lastRequiredValues.fatRequired
    }

    return totals
  } catch (error) {
    console.error('Error calculating today nutrition totals:', error)
    return {
      caloriesConsumed: 0,
      caloriesRequired: 0,
      proteinConsumed: 0,
      proteinRequired: 0,
      carbsConsumed: 0,
      carbsRequired: 0,
      fatConsumed: 0,
      fatRequired: 0
    }
  }
}

export async function getLastNonZeroRequiredValues(userId: string): Promise<{
  caloriesRequired: number;
  proteinRequired: number;
  carbsRequired: number;
  fatRequired: number;
}> {
  try {
    const { data, error } = await supabase
      .from("nutrition_tracking")
      .select("calories_required, protein_required, carbs_required, fat_required")
      .eq("user_id", userId)
      .or("calories_required.gt.0,protein_required.gt.0,carbs_required.gt.0,fat_required.gt.0")
      .order("timestamp", { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      return {
        caloriesRequired: Number(data[0].calories_required) || 0,
        proteinRequired: Number(data[0].protein_required) || 0,
        carbsRequired: Number(data[0].carbs_required) || 0,
        fatRequired: Number(data[0].fat_required) || 0
      }
    } else {
      return {
        caloriesRequired: 0,
        proteinRequired: 0,
        carbsRequired: 0,
        fatRequired: 0
      }
    }
  } catch (error) {
    console.error('Error getting last non-zero required values:', error)
    return {
      caloriesRequired: 0,
      proteinRequired: 0,
      carbsRequired: 0,
      fatRequired: 0
    }
  }
}

export async function updateNutritionTracking(
  id: number,
  proteinConsumed?: number,
  proteinRequired?: number,
  carbsConsumed?: number,
  carbsRequired?: number,
  fatConsumed?: number,
  fatRequired?: number,
  caloriesConsumed?: number,
  caloriesRequired?: number
): Promise<boolean> {
  try {
    const updateData: any = {}
    
    if (proteinConsumed !== undefined) updateData.protein_consumed = proteinConsumed
    if (proteinRequired !== undefined) updateData.protein_required = proteinRequired
    if (carbsConsumed !== undefined) updateData.carbs_consumed = carbsConsumed
    if (carbsRequired !== undefined) updateData.carbs_required = carbsRequired
    if (fatConsumed !== undefined) updateData.fat_consumed = fatConsumed
    if (fatRequired !== undefined) updateData.fat_required = fatRequired
    if (caloriesConsumed !== undefined) updateData.calories_consumed = caloriesConsumed
    if (caloriesRequired !== undefined) updateData.calories_required = caloriesRequired

    const { data, error } = await supabase
      .from("nutrition_tracking")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error updating nutrition tracking:', error)
    return false
  }
}

// ====== Workout Tracking Functions ======

export interface WorkoutTrackingData {
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

export async function insertWorkoutTracking(
  userId: string,
  workoutData: WorkoutTrackingData
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("workout_tracking")
      .insert({
        user_id: userId,
        workout_day_name: workoutData.workout_day_name,
        exercise_name: workoutData.exercise_name,
        required_sets: workoutData.required_sets || 0,
        required_reps: workoutData.required_reps || 0,
        required_weight: workoutData.required_weight,
        suggested_rest_time: workoutData.suggested_rest_time || 0,
        completed_sets: workoutData.completed_sets || 0,
        completed_reps: workoutData.completed_reps || 0,
        completed_weight: workoutData.completed_weight,
        actual_rest_time: workoutData.actual_rest_time || 0,
        perceived_effort: workoutData.perceived_effort,
        form_quality: workoutData.form_quality,
        notes: workoutData.notes,
        workout_date: workoutData.workout_date ? new Date(workoutData.workout_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
      .select()

    if (error) {
      // Handle unique constraint violations (duplicate entries for same day/exercise)
      if (error.code === '23505') { // unique_violation
        console.log('Workout entry already exists for this day and exercise, skipping insertion')
        return true // Consider this successful since data exists
      }
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error inserting workout tracking:', error)
    return false
  }
}

export async function getTodayWorkoutTracking(userId: string): Promise<any[]> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from("workout_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("workout_date", today)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting today workout tracking:', error)
    return []
  }
}

export async function updateWorkoutTracking(
  id: number,
  updates: Partial<WorkoutTrackingData>
): Promise<boolean> {
  try {
    const updateData: any = {}

    if (updates.required_sets !== undefined) updateData.required_sets = updates.required_sets
    if (updates.required_reps !== undefined) updateData.required_reps = updates.required_reps
    if (updates.required_weight !== undefined) updateData.required_weight = updates.required_weight
    if (updates.suggested_rest_time !== undefined) updateData.suggested_rest_time = updates.suggested_rest_time
    if (updates.completed_sets !== undefined) updateData.completed_sets = updates.completed_sets
    if (updates.completed_reps !== undefined) updateData.completed_reps = updates.completed_reps
    if (updates.completed_weight !== undefined) updateData.completed_weight = updates.completed_weight
    if (updates.actual_rest_time !== undefined) updateData.actual_rest_time = updates.actual_rest_time
    if (updates.perceived_effort !== undefined) updateData.perceived_effort = updates.perceived_effort
    if (updates.form_quality !== undefined) updateData.form_quality = updates.form_quality
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from("workout_tracking")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error updating workout tracking:', error)
    return false
  }
}

export async function getWorkoutTrackingByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("workout_tracking")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", startDate)
      .lte("workout_date", endDate)
      .order("workout_date", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting workout tracking by date range:', error)
    return []
  }
}