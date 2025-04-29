
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
    
    // Fetch the current status first to have it available for comparison
    const { data: currentProject } = await supabase
      .from('projects')
      .select('status, client_name')
      .eq('id', projectId)
      .single();
    
    const oldStatus = currentProject?.status;
    
    // Update the status
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    
    if (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
    
    console.log(`Project status updated from ${oldStatus} to ${newStatus}`);
    
    return { success: true, oldStatus, newStatus, projectName: currentProject?.client_name };
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
    console.log('Setting up new realtime channel for projects table...');
    
    // First, ensure the channel doesn't already exist 
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic === 'project-status-updates') {
        console.log('Removing existing project-status-updates channel');
        supabase.removeChannel(ch);
      }
    });
    
    // Use a consistent channel name for all project updates
    const channel = supabase
      .channel('project-status-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          console.log('Real-time update received in supabase.ts:', payload);
          
          if (payload.eventType === 'UPDATE' && 
              payload.old && payload.new && 
              payload.old.status !== payload.new.status) {
            console.log(`Status changed from "${payload.old.status}" to "${payload.new.status}" for project "${payload.new.client_name}"`);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status in supabase.ts: ${status}`);
      });
    
    console.log('Realtime subscription for projects enabled with channel: project-status-updates');
    return channel;
  } catch (error) {
    console.error('Error enabling realtime for projects:', error);
    return null;
  }
}
