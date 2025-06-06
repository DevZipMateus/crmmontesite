
import { supabase } from "@/lib/supabase/client";
import { formatDate, createNotificationId } from "@/utils/notificationUtils";
import { Notification } from "@/types/notification";

type NotificationCallback = (notification: Notification) => void;

/**
 * Service to handle realtime notifications from Supabase
 * Consolidating status change monitoring in one place
 */
export function setupNotificationRealtime(
  onNewNotification: NotificationCallback,
  dismissedIds: string[]
) {
  console.log('[notificationRealtimeService] Setting up realtime subscription for project status changes');
  
  // First, check if the channel already exists and remove it to prevent duplicates
  const existingChannels = supabase.getChannels();
  existingChannels.forEach(ch => {
    if (ch.topic === 'notification-status-changes') {
      console.log('[notificationRealtimeService] Removing existing notification-status-changes channel');
      supabase.removeChannel(ch);
    }
  });
  
  // Set up a dedicated channel just for notification status updates with a unique name
  const channel = supabase
    .channel('notification-status-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects'
      },
      (payload) => {
        console.log('[notificationRealtimeService] Received update payload:', payload);
        
        if (payload.new && payload.old && payload.new.status !== payload.old.status) {
          const projectName = payload.new.client_name;
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          const projectId = payload.new.id;
          
          console.log('[notificationRealtimeService] Status changed from', oldStatus, 'to', newStatus, 'for project', projectName);
          
          // Create a unique ID based on project ID, old status, new status, and timestamp
          const notificationId = createNotificationId('status-change', projectId, oldStatus, newStatus);
          console.log('[notificationRealtimeService] Generated notification ID:', notificationId);
          
          // Check if this notification is already dismissed
          if (dismissedIds.includes(notificationId)) {
            console.log('[notificationRealtimeService] Notification was previously dismissed, not showing it');
            return;
          }
          
          const formattedDate = formatDate(new Date());
          
          const newNotification: Notification = {
            id: notificationId,
            title: "Status de projeto alterado",
            description: `O projeto "${projectName}" foi movido de "${oldStatus}" para "${newStatus}"`,
            date: formattedDate,
            read: false,
            type: "info"
          };
          
          console.log('[notificationRealtimeService] Creating new notification:', newNotification);
          
          // Call the callback with the new notification
          onNewNotification(newNotification);
          console.log('[notificationRealtimeService] Notification callback executed');
        }
      }
    )
    .subscribe((status) => {
      console.log(`[notificationRealtimeService] Subscription status: ${status}`);
    });

  return channel;
}
