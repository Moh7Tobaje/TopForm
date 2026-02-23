// Simple database connection test
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local if it exists
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET')

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test connection by fetching analysis_results
  supabase
    .from('analysis_results')
    .select('count')
    .then(({ data, error }) => {
      if (error) {
        console.error('Database error:', error)
      } else {
        console.log('Database connection successful!')
        console.log('Analysis results count:', data?.length || 0)
      }
    })
    .catch(err => {
      console.error('Connection error:', err)
    })
} else {
  console.error('Missing environment variables')
}
