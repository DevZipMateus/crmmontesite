
import React, { useEffect } from "react";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { RecentProjectsCard } from "@/components/dashboard/RecentProjectsCard";
import { Notification } from "@/components/dashboard/useNotifications";
import { Project } from "@/types/project";
import { supabase } from "@/lib/supabase";

interface InfoCardsSectionProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  projects: Project[];
}

export function InfoCardsSection({ 
  notifications, 
  onMarkAsRead, 
  onDismiss, 
  projects 
}: InfoCardsSectionProps) {
  // Enable realtime for projects when component mounts
  useEffect(() => {
    const channel = supabase
      .channel('info-cards-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          console.log('Project update received in InfoCardsSection:', payload);
          if (payload.eventType === 'UPDATE') {
            console.log('Status changed:', payload.old.status, '->', payload.new.status);
          }
        }
      )
      .subscribe();
      
    // Cleanup function to remove the channel subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <NotificationsCard 
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onDismiss={onDismiss}
      />
      <RecentProjectsCard 
        projects={projects.slice(0, 5).map(p => ({
          id: p.id,
          client_name: p.client_name,
          status: p.status,
          created_at: p.created_at,
          template: p.template
        }))} 
      />
    </div>
  );
}
