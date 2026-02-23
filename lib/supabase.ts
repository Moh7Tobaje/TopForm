import { createClient } from '@supabase/supabase-js'

// Temporary hardcoded values for testing - move to .env.local in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gqyntmtuaylixkexpnbr.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeW50bXR1YXlsaXhrZXhwbmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5ODk3NCwiZXhwIjoyMDcwNTc0OTc0fQ.VN4kwBki0pKI_yp5xISmW5UrxUgletZHVrdflpFUFqQ'

console.log('Supabase config check:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseKey ? 'configured' : 'missing'
})

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
  try {
    supabase = createClient(supabaseUrl, supabaseKey)

    // Service client for API routes (bypasses RLS)
    supabaseService = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Error initializing Supabase client:', error)
    // Fallback to mock client
    supabase = {
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization failed' } })
        })
      })
    }
    supabaseService = supabase
  }
}

export { supabase, supabaseService }
