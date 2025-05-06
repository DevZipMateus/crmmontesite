
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Project } from "@/types/project";
import {
  ProjectCardHeader,
  ProjectCardActions,
  ProjectCardDomain,
  StatusButtonsGrid
} from "./ProjectCardComponents";

interface ProjectCardProps {
  project: Project;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  draggingId: string | null;
  updatingStatus: boolean;
  statusOptions: Array<{ value: string; color: string }>;
  onProjectDeleted?: () => void;
}

export default function ProjectCard({
  project,
  onDragStart,
  onStatusChange,
  draggingId,
  updatingStatus,
  statusOptions,
  onProjectDeleted
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [hasPendingCustomizations, setHasPendingCustomizations] = useState(
    project.hasPendingCustomizations || false
  );

  useEffect(() => {
    // Verifica customizações pendentes se ainda não foram verificadas
    if (project.hasPendingCustomizations === undefined) {
      checkPendingCustomizations();
    }
  }, [project.id]);

  const checkPendingCustomizations = async () => {
    try {
      const { data, error } = await supabase
        .from("project_customizations")
        .select("id")
        .eq("project_id", project.id)
        .in("status", ["Solicitado", "Em andamento"])
        .limit(1);

      if (error) {
        console.error("Erro ao verificar customizações:", error);
        return;
      }

      setHasPendingCustomizations(data && data.length > 0);
    } catch (error) {
      console.error("Erro ao verificar customizações:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(project.id, newStatus);
  };

  return (
    <Card 
      key={project.id} 
      className={`p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${draggingId === project.id ? 'opacity-50' : ''} animate-fade-in ${hasPendingCustomizations ? 'border-l-4 border-l-orange-500' : ''}`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, project.id)}
    >
      <ProjectCardHeader 
        clientName={project.client_name} 
        template={project.template} 
        hasPendingCustomizations={hasPendingCustomizations}
      />
      
      <ProjectCardDomain domain={project.domain} />

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">
          {formatDate(project.created_at)}
        </span>
        
        <ProjectCardActions 
          projectId={project.id}
          projectName={project.client_name}
          onViewEdit={handleViewEdit}
          onProjectDeleted={onProjectDeleted}
        />
      </div>
      
      <div className="mt-2 pt-2 border-t">
        <StatusButtonsGrid
          currentStatus={project.status}
          statusOptions={statusOptions}
          updatingStatus={updatingStatus}
          onStatusChange={handleStatusChange}
        />
      </div>
    </Card>
  );
}
