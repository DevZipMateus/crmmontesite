
import { createClient } from '@supabase/supabase-js';
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Usar o cliente Supabase da integração nativa do Lovable
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
