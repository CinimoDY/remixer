import { createClient } from '@supabase/supabase-js'

// Debug logging for environment variables
console.log('Environment check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  url: import.meta.env.VITE_SUPABASE_URL // Log the actual URL for verification
})

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
  console.log('Initializing Supabase client with URL:', requiredEnvVars.VITE_SUPABASE_URL)
  
  try {
    const client = createClient(
      requiredEnvVars.VITE_SUPABASE_URL,
      requiredEnvVars.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        },
        db: {
          schema: 'public'
        }
      }
    )
    
    // Test the connection immediately with more detailed error logging
    client.from('saved_tweets').select('count', { count: 'exact', head: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Initial connection test failed:', {
            error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
        } else {
          console.log('Successfully connected to Supabase', { data })
        }
      })
      .catch(err => {
        console.error('Connection test threw an unexpected error:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        })
      })
    
    return client
  } catch (error) {
    console.error('Failed to initialize Supabase client:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw new Error('Failed to initialize database connection')
  }
}

export const supabase = initSupabaseClient()

// Add connection status monitoring
let isConnectionError = false
let lastConnectionCheck = 0
const CONNECTION_CHECK_INTERVAL = 5000 // 5 seconds

// Add content types enum
export const CONTENT_TYPES = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin'
}

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

// Add a test function
export const testConnection = async () => {
  console.log('Testing Supabase connection...')
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Connection test failed:', error)
      return { success: false, error }
    }

    console.log('Connection test successful:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Connection test threw an error:', error)
    return { success: false, error }
  }
}

// Run test immediately
testConnection() 