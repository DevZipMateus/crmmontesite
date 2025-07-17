
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { 
  ProjectCardHeader,
  ProjectCardActions,
  ProjectCardDomain,
  StatusButtonsGrid,
  PartnerIndicator,
  FormStatusIndicator,
  CustomizationDeadlineIndicator
} from "./ProjectCardComponents";
import { LeadLinkIndicator } from "../LeadLinkIndicator";

interface ProjectCardProps {
  project: Project;
  statusOptions: Array<{ value: string; color: string }>;
  onDragStart: (id: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  updatingStatus: string | null;
  onProjectDeleted?: () => void;
}

export default function ProjectCard({
  project,
  statusOptions,
  onDragStart,
  onStatusChange,
  updatingStatus,
  onProjectDeleted,
}: ProjectCardProps) {
  const isUpdating = updatingStatus === project.id;

  return (
    <Card
      className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 border-l-primary/20"
      draggable
      onDragStart={() => onDragStart(project.id)}
    >
      <div className="space-y-3">
        <ProjectCardHeader project={project} />
        
        {/* Indicador de Lead Vinculado */}
        {project.lead_id && (
          <div className="pt-2">
            <LeadLinkIndicator project={project} />
          </div>
        )}
        
        <PartnerIndicator project={project} />
        <FormStatusIndicator project={project} />
        <CustomizationDeadlineIndicator project={project} />
        <ProjectCardDomain project={project} />
        
        <StatusButtonsGrid
          project={project}
          statusOptions={statusOptions}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
        
        <ProjectCardActions 
          projectId={project.id}
          projectName={project.client_name}
          onProjectDeleted={onProjectDeleted}
        />
      </div>
    </Card>
  );
}
