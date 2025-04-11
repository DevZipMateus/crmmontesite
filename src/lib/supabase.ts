
import { createClient } from '@supabase/supabase-js';

// Read environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in a browser environment before logging warnings
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not defined. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  }
}

// Initialize the Supabase client with strict checking
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper function to get the client with error handling
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return supabase;
}
