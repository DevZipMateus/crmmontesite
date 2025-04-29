
import { supabase } from './client';

// Enable realtime updates for the projects table
export async function enableRealtimeForProjects() {
  try {
    console.log('[realtime.ts] Setting up new realtime channel for projects table...');
    
    // First, ensure the channel doesn't already exist 
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic === 'project-changes-monitor') {
        console.log('[realtime.ts] Removing existing project-changes-monitor channel');
        supabase.removeChannel(ch);
      }
    });
    
    // Use a different channel name to avoid conflicts with notificationRealtimeService
    const channel = supabase
      .channel('project-changes-monitor')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          console.log('[realtime.ts] Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' && 
              payload.old && payload.new && 
              payload.old.status !== payload.new.status) {
            console.log(`[realtime.ts] Status changed from "${payload.old.status}" to "${payload.new.status}" for project "${payload.new.client_name}"`);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[realtime.ts] Realtime subscription status: ${status}`);
      });
    
    console.log('[realtime.ts] Realtime subscription for projects enabled with channel: project-changes-monitor');
    return channel;
  } catch (error) {
    console.error('[realtime.ts] Error enabling realtime for projects:', error);
    return null;
  }
}

// Helper function to clean up realtime subscriptions
export function cleanupRealtimeSubscriptions() {
  const existingChannels = supabase.getChannels();
  existingChannels.forEach(ch => {
    if (ch.topic === 'project-changes-monitor' || ch.topic === 'realtime-notifications') {
      console.log('[realtime.ts] Cleaning up channel:', ch.topic);
      supabase.removeChannel(ch);
    }
  });
}
