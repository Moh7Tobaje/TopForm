import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any
let supabaseService: any

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using mock client.')
  
  // Return a mock client that gracefully handles missing configuration
  supabase = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      })
    })
  }
  
  supabaseService = supabase
} else {
  supabase = createClient(supabaseUrl, supabaseKey)

  // Service client for API routes (bypasses RLS)
  supabaseService = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export { supabase, supabaseService }
