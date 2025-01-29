import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file and Vercel environment settings.')
}

export const supabase = createClient(
  supabaseUrl || 'fallback-url', // This will be replaced by Vercel env
  supabaseAnonKey || 'fallback-key' // This will be replaced by Vercel env
)

// Add error handling for connection status
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Handle potential auth issues
    console.warn('Supabase connection issue detected')
  }
}) 