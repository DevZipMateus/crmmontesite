
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Use the Supabase client from the native Lovable integration
export const supabase = integrationSupabase;

// Helper function to get the client with error handling
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Please check your connection to Supabase.'
    );
  }
  return supabase;
}
