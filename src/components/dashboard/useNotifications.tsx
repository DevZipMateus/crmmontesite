
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

export function useNotifications() {
  const { toast } = useToast();
  
  // Store dismissed notification IDs in state to prevent them from reappearing
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  
  // Base notifications that will be filtered against dismissed IDs
  const [baseNotifications, setBaseNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Novo projeto criado",
      description: "O projeto 'Site da Empresa XYZ' foi criado com sucesso.",
      date: "Hoje, 10:30",
      read: false,
      type: "info"
    },
    {
      id: "2",
      title: "Projeto aguardando customização",
      description: "O cliente 'ABC Ltda' solicitou customizações.",
      date: "Ontem, 15:45",
      read: true,
      type: "warning"
    },
    {
      id: "3",
      title: "Domínio configurado",
      description: "O domínio 'empresa.com.br' foi configurado com sucesso.",
      date: "25/04/2025",
      read: true,
      type: "success"
    }
  ]);
  
  // Derived state: filter out dismissed notifications
  const [notifications, setNotifications] = useState<Notification[]>(baseNotifications);
  
  // Use effect to filter notifications whenever dismissedNotificationIds changes
  useEffect(() => {
    setNotifications(baseNotifications.filter(
      notification => !dismissedNotificationIds.includes(notification.id)
    ));
  }, [baseNotifications, dismissedNotificationIds]);
  
  // Listen for project status changes and create notifications
  useEffect(() => {
    const channel = supabase
      .channel('projects-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: 'status=neq.previous.status'
        },
        (payload) => {
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const projectName = payload.new.client_name;
            const newStatus = payload.new.status;
            
            const newNotificationId = `status-${Date.now()}`;
            const newNotification: Notification = {
              id: newNotificationId,
              title: "Status de projeto alterado",
              description: `O projeto "${projectName}" foi movido para "${newStatus}"`,
              date: "Agora",
              read: false,
              type: "info"
            };
            
            setBaseNotifications(prev => [newNotification, ...prev]);
            
            // Also show a toast
            toast({
              title: "Status de projeto alterado",
              description: `O projeto "${projectName}" foi movido para "${newStatus}"`,
            });
          }
        }
      )
      .subscribe();

    return () => {
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
