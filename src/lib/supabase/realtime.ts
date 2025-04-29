
import { supabase } from './client';

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
          console.log('Real-time update received in realtime.ts:', payload);
          
          if (payload.eventType === 'UPDATE' && 
              payload.old && payload.new && 
              payload.old.status !== payload.new.status) {
            console.log(`Status changed from "${payload.old.status}" to "${payload.new.status}" for project "${payload.new.client_name}"`);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status in realtime.ts: ${status}`);
      });
    
    console.log('Realtime subscription for projects enabled with channel: project-status-updates');
    return channel;
  } catch (error) {
    console.error('Error enabling realtime for projects:', error);
    return null;
  }
}

// Helper function to clean up realtime subscriptions
export function cleanupRealtimeSubscriptions() {
  const existingChannels = supabase.getChannels();
  existingChannels.forEach(ch => {
    if (ch.topic === 'project-status-updates') {
      console.log('Cleaning up project-status-updates channel');
      supabase.removeChannel(ch);
    }
  });
}
