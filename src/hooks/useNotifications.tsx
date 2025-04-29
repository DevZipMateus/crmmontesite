
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Notification } from "@/types/notification";
import { notificationStorage } from "@/services/notificationStorage";
import { setupNotificationRealtime } from "@/services/notificationRealtimeService";
import { formatDate, createNotificationId } from "@/utils/notificationUtils";

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const { toast } = useToast();
  
  // Store notifications in state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Store dismissed notification IDs in state to prevent them from reappearing
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  
  // Load initial notifications and dismissed IDs from localStorage on init
  useEffect(() => {
    const savedNotifications = notificationStorage.loadNotifications();
    setNotifications(savedNotifications);
    
    const savedDismissedIds = notificationStorage.loadDismissedIds();
    setDismissedNotificationIds(savedDismissedIds);
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    notificationStorage.saveNotifications(notifications);
    console.log("Notifications saved to localStorage:", notifications.length);
  }, [notifications]);
  
  // Save dismissed IDs to localStorage when they change
  useEffect(() => {
    notificationStorage.saveDismissedIds(dismissedNotificationIds);
    console.log("Dismissed notifications updated in localStorage:", dismissedNotificationIds);
  }, [dismissedNotificationIds]);
  
  // Debug notifications
  useEffect(() => {
    console.log("useNotifications hook - Current notifications:", notifications);
  }, [notifications]);
  
  // Listen for project status changes and create notifications
  useEffect(() => {
    const addNotification = (newNotification: Notification) => {
      console.log('[useNotifications] Attempting to add new notification:', newNotification);
      
      // Check if this notification already exists
      setNotifications(prev => {
        // Check if we already have this notification by ID
        const existingIndex = prev.findIndex(n => n.id === newNotification.id);
        
        if (existingIndex >= 0) {
          console.log('[useNotifications] Notification with this ID already exists, not adding duplicate');
          return prev;
        }
        
        console.log('[useNotifications] Adding new notification to state');
        const updated = [newNotification, ...prev];
        return updated;
      });
      
      // Also show a toast
      toast({
        title: newNotification.title,
        description: newNotification.description,
      });
      
      console.log('[useNotifications] Notification added and toast displayed');
    };

    console.log('[useNotifications] Setting up notification realtime subscription');
    const channel = setupNotificationRealtime(addNotification, dismissedNotificationIds);

    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up useNotifications subscription');
      supabase.removeChannel(channel);
    };
  }, [toast, dismissedNotificationIds]);
  
  /**
   * Mark a notification as read
   */
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
  
  /**
   * Dismiss a notification
   */
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

  /**
   * Add a test notification
   */
  const addTestNotification = () => {
    const testNotificationId = createNotificationId('test', `test-${Date.now()}`);
    console.log('Creating test notification with ID:', testNotificationId);
    
    // Don't allow multiple test notifications
    if (notifications.some(n => n.id.startsWith('test_'))) {
      console.log('Test notification already exists, not adding another one');
      
      toast({
        title: "Notificação de teste já existe",
        description: "Uma notificação de teste já está presente no sistema.",
      });
      return;
    }
    
    const testNotification: Notification = {
      id: testNotificationId,
      title: "Notificação de teste",
      description: "Isto é uma notificação de teste para verificar se o sistema está funcionando",
      date: formatDate(new Date()),
      read: false,
      type: "info"
    };
    
    console.log('Adding test notification to state:', testNotification);
    setNotifications(prev => [testNotification, ...prev]);
    
    toast({
      title: "Notificação de teste criada",
      description: "Uma notificação de teste foi adicionada ao sistema.",
    });
  };

  /**
   * Clear all notifications
   */
  const clearAllNotifications = () => {
    console.log('Clearing all notifications');
    
    // Add all current notification IDs to dismissed list
    const currentIds = notifications.map(notification => notification.id);
    setDismissedNotificationIds(prev => [...prev, ...currentIds]);
    
    // Clear the notifications list
    setNotifications([]);
    
    toast({
      title: "Notificações limpas",
      description: "Todas as notificações foram removidas com sucesso.",
    });
  };

  return {
    notifications,
    markNotificationAsRead,
    dismissNotification,
    addTestNotification,
    clearAllNotifications
  };
}
