
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
import { ClientTypeBadge } from "../ClientTypeBadge";
import { getClientTypeInfo } from "@/utils/clientTypeUtils";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const clientTypeInfo = getClientTypeInfo(project);

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    if (action === 'view') {
      navigate(`/projeto/${projectId}`);
    } else {
      navigate(`/projeto/editar/${projectId}`);
    }
  };

  return (
    <Card
      className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 ${clientTypeInfo.borderColor} ${clientTypeInfo.cardBgColor}`}
      draggable
      onDragStart={() => onDragStart(project.id)}
    >
      <div className="space-y-3">
        {/* Badge do tipo de cliente */}
        <div className="flex justify-end">
          <ClientTypeBadge project={project} variant="badge" />
        </div>
        
        <ProjectCardHeader 
          clientName={project.client_name}
          template={project.template || ''}
          hasPendingCustomizations={project.hasPendingCustomizations || false}
          createdAt={project.created_at}
        />
        
        {/* Indicador de Lead Vinculado */}
        {project.lead_id && (
          <div className="pt-2">
            <LeadLinkIndicator project={project} />
          </div>
        )}
        
        {project.partner_hash && (
          <PartnerIndicator partnerHash={project.partner_hash} />
        )}
        
        <FormStatusIndicator 
          formularioPreenchido={project.formulario_preenchido || false}
          partnerHash={project.partner_hash}
          modeloEscolhido={project.modelo_escolhido}
          dataFormulario={project.data_formulario}
        />
        
        <CustomizationDeadlineIndicator 
          status={project.status || ''}
          siteReadyDate={project.site_ready_date}
          customizationDeadline={project.customization_deadline}
          requiresPaidCustomization={project.requires_paid_customization}
        />
        
        <ProjectCardDomain domain={project.domain} />
        
        <StatusButtonsGrid
          project={project}
          statusOptions={statusOptions}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
        
        <ProjectCardActions 
          projectId={project.id}
          projectName={project.client_name}
          onViewEdit={handleViewEdit}
          onProjectDeleted={onProjectDeleted}
        />
      </div>
    </Card>
  );
}
