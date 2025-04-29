
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
  
  // Store notifications in state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Store dismissed notification IDs in state to prevent them from reappearing
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  
  // Load initial notifications and dismissed IDs from localStorage on init
  useEffect(() => {
    try {
      // Load saved notifications
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        console.log('Loading saved notifications from localStorage:', savedNotifications);
        setNotifications(JSON.parse(savedNotifications));
      } else {
        console.log('No saved notifications found in localStorage');
      }
      
      // Load dismissed notifications
      const savedDismissed = localStorage.getItem('dismissedNotifications');
      if (savedDismissed) {
        console.log('Loading dismissed notifications from localStorage:', savedDismissed);
        setDismissedNotificationIds(JSON.parse(savedDismissed));
      } else {
        console.log('No dismissed notifications found in localStorage');
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      console.log('Notifications saved to localStorage:', notifications.length);
    }
  }, [notifications]);
  
  // Save dismissed IDs to localStorage when they change
  useEffect(() => {
    if (dismissedNotificationIds.length > 0) {
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotificationIds));
      console.log('Dismissed notifications updated in localStorage:', dismissedNotificationIds);
    }
  }, [dismissedNotificationIds]);
  
  // Debug notifications
  useEffect(() => {
    console.log("useNotifications hook - Current notifications:", notifications);
  }, [notifications]);
  
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
    
    // Set up a new channel for project status updates
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
            
            // Check if this notification is already dismissed
            if (dismissedNotificationIds.includes(newNotificationId)) {
              console.log('[useNotifications] Notification was previously dismissed, not showing it');
              return;
            }
            
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
            
            // Update notifications with the new notification at the beginning
            setNotifications(prev => {
              // First check if we already have this notification (prevent duplicates)
              const existingIndex = prev.findIndex(n => 
                n.description === newNotification.description && 
                n.title === newNotification.title
              );
              
              if (existingIndex >= 0) {
                console.log('[useNotifications] Similar notification already exists, not adding duplicate');
                return prev;
              }
              
              const updated = [newNotification, ...prev];
              console.log('[useNotifications] Updated notifications:', updated);
              return updated;
            });
            
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
  }, [toast, dismissedNotificationIds]);
  
  const markNotificationAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
    setNotifications(prevNotifications => 
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
    console.log('Dismissing notification:', id);
    // Add the ID to dismissed notifications list
    setDismissedNotificationIds(prev => [...prev, id]);
    
    // Also remove it from current notifications
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso.",
    });
  };

  // Add a test notification function for debugging
  const addTestNotification = () => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: "Notificação de teste",
      description: "Isto é uma notificação de teste para verificar se o sistema está funcionando",
      date: formatDate(new Date()),
      read: false,
      type: "info"
    };
    
    setNotifications(prev => [testNotification, ...prev]);
    
    toast({
      title: "Notificação de teste criada",
      description: "Uma notificação de teste foi adicionada ao sistema.",
    });
  };

  return {
    notifications,
    markNotificationAsRead,
    dismissNotification,
    addTestNotification // Expose this for testing
  };
}
