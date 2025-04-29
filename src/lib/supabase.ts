
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

// Helper to update project status across the application
export async function updateProjectStatus(projectId: string, newStatus: string) {
  try {
    console.log(`Updating project ${projectId} status to ${newStatus}`);
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    
    if (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating project status:', error);
    return { success: false, error };
  }
}

// Function to ensure consistent status values
export const PROJECT_STATUS_TYPES = [
  { value: "Recebido", icon: "Inbox", color: "bg-purple-500" },
  { value: "Criando site", icon: "Code", color: "bg-blue-500" },
  { value: "Configurando Domínio", icon: "Globe", color: "bg-amber-500" },
  { value: "Aguardando DNS", icon: "Clock", color: "bg-orange-500" },
  { value: "Site pronto", icon: "CheckCircle2", color: "bg-green-500" }
];

// Enable realtime updates for the projects table
export async function enableRealtimeForProjects() {
  try {
    // Initialize a Supabase channel for real-time updates
    const channel = supabase
      .channel('public:projects')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
        }
      )
      .subscribe();
    
    console.log('Realtime subscription for projects enabled');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for projects:', error);
    return false;
  }
}
