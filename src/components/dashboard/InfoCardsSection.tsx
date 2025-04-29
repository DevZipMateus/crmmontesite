
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
    console.log('InfoCardsSection mounting - setting up realtime subscription');
    
    // First, check if the channel already exists and remove it to prevent duplicates
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic === 'project-status-updates') {
        console.log('Removing existing project-status-updates channel in InfoCardsSection');
        supabase.removeChannel(ch);
      }
    });
    
    // Use a consistent channel name for project updates
    const channel = supabase
      .channel('project-status-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          console.log('Project update received in InfoCardsSection:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
            if (payload.old.status !== payload.new.status) {
              console.log(`Status changed: "${payload.old.status}" -> "${payload.new.status}" for project "${payload.new.client_name}"`);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`InfoCardsSection subscription status: ${status}`);
      });
      
    // Cleanup function to remove the channel subscription when component unmounts
    return () => {
      console.log('Cleaning up InfoCardsSection realtime subscription');
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
