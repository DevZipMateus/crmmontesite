
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

// Helper function to format date for notifications
function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000; // 24 hours in milliseconds
  
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  if (date.getTime() >= today) {
    return `Hoje, ${time}`;
  } else if (date.getTime() >= yesterday) {
    return `Ontem, ${time}`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}

export function useNotifications() {
  const { toast } = useToast();
  
  // Store dismissed notification IDs in state to prevent them from reappearing
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  
  // Initialize with empty array instead of demo notifications
  const [baseNotifications, setBaseNotifications] = useState<Notification[]>([]);
  
  // Derived state: filter out dismissed notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load dismissed notifications from localStorage on init
  useEffect(() => {
    const savedDismissed = localStorage.getItem('dismissedNotifications');
    if (savedDismissed) {
      try {
        setDismissedNotificationIds(JSON.parse(savedDismissed));
      } catch (e) {
        console.error('Error parsing dismissed notifications:', e);
      }
    }
  }, []);
  
  // Update notifications whenever baseNotifications or dismissedNotificationIds change
  useEffect(() => {
    const filtered = baseNotifications.filter(
      notification => !dismissedNotificationIds.includes(notification.id)
    );
    setNotifications(filtered);
    console.log('Notifications updated:', filtered.length, 'active notifications');
  }, [baseNotifications, dismissedNotificationIds]);
  
  // Sync dismissed notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);
  
  // Listen for project status changes and create notifications
  useEffect(() => {
    console.log('Setting up realtime subscription for project status changes in useNotifications');
    
    // First, check if the channel already exists and remove it to prevent duplicates
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic === 'project-status-updates') {
        console.log('Removing existing project-status-updates channel in useNotifications');
        supabase.removeChannel(ch);
      }
    });
    
    // Ensure we use the same channel name as in other components for consistency
    const channel = supabase
      .channel('project-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[useNotifications] Received update payload:', payload);
          
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            console.log('[useNotifications] Status changed from', payload.old.status, 'to', payload.new.status);
            
            const projectName = payload.new.client_name;
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            // Create a unique ID based on timestamp and project ID
            const newNotificationId = `status-${Date.now()}-${payload.new.id}`;
            
            const formattedDate = formatDate(new Date());
            
            const newNotification: Notification = {
              id: newNotificationId,
              title: "Status de projeto alterado",
              description: `O projeto "${projectName}" foi movido de "${oldStatus}" para "${newStatus}"`,
              date: formattedDate,
              read: false,
              type: "info"
            };
            
            console.log('[useNotifications] Creating new notification:', newNotification);
            
            // Update baseNotifications with the new notification at the beginning
            setBaseNotifications(prev => [newNotification, ...prev]);
            
            // Also show a toast
            toast({
              title: "Status de projeto alterado",
              description: `O projeto "${projectName}" foi movido para "${newStatus}"`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useNotifications] Subscription status: ${status}`);
      });

    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up useNotifications subscription');
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const markNotificationAsRead = (id: string) => {
    setBaseNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi atualizada com sucesso.",
    });
  };
  
  const dismissNotification = (id: string) => {
    // Add the ID to dismissed notifications list
    setDismissedNotificationIds(prev => [...prev, id]);
    
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso.",
    });
  };

  return {
    notifications,
    markNotificationAsRead,
    dismissNotification
  };
}
