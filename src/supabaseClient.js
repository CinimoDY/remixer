import { createClient } from '@supabase/supabase-js'

// Check for required environment variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`)
    throw new Error(`Configuration Error: ${key} is not set. Please check your environment variables.`)
  }
})

// Initialize Supabase client with retry logic
const initSupabaseClient = () => {
  try {
    return createClient(
      requiredEnvVars.VITE_SUPABASE_URL,
      requiredEnvVars.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    )
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    throw new Error('Failed to initialize database connection')
  }
}

export const supabase = initSupabaseClient()

// Add connection status monitoring
let isConnectionError = false
let lastConnectionCheck = 0
const CONNECTION_CHECK_INTERVAL = 5000 // 5 seconds

// Export connection status checker with rate limiting
export const checkSupabaseConnection = async () => {
  try {
    // Rate limit connection checks
    const now = Date.now()
    if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
      if (isConnectionError) {
        return { error: 'Database connection error. Retrying...' }
      }
      return { error: null }
    }
    
    lastConnectionCheck = now

    if (isConnectionError) {
      console.log('Attempting to recover from previous connection error...')
    }

    const { error: pingError } = await supabase.from('saved_tweets').select('count', { count: 'exact', head: true })
    
    if (pingError) {
      throw pingError
    }

    // Connection successful, reset error state
    isConnectionError = false
    return { error: null }
  } catch (error) {
    isConnectionError = true
    console.error('Supabase connection error:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('Failed to fetch')) {
      return { 
        error: 'Unable to reach the database. Please check your internet connection.'
      }
    }
    
    if (error.message?.includes('JWT')) {
      return {
        error: 'Authentication error. Please refresh the page.'
      }
    }

    return { 
      error: 'Database connection error. Please try again later.'
    }
  }
} 