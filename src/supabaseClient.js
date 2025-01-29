import { createClient } from '@supabase/supabase-js'

// Check for required environment variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

// Initialize Supabase client
export const supabase = createClient(
  requiredEnvVars.VITE_SUPABASE_URL,
  requiredEnvVars.VITE_SUPABASE_ANON_KEY
)

// Add connection status monitoring
let isConnectionError = false

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    isConnectionError = true
    console.warn('Supabase connection issue detected')
  }
})

// Export connection status checker
export const checkSupabaseConnection = async () => {
  try {
    if (isConnectionError) {
      throw new Error('Connection already marked as errored')
    }
    const { error } = await supabase.from('saved_tweets').select('count', { count: 'exact', head: true })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Supabase connection error:', error)
    return { 
      error: 'Database connection error. Please check your internet connection or try again later.'
    }
  }
} 