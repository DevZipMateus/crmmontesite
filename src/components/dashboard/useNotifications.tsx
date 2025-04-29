
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
