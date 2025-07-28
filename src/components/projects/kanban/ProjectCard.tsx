
import React, { useState } from "react";
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
  CustomizationDeadlineIndicator,
  EditableAssignedProgrammer
} from "./ProjectCardComponents";
import { LeadLinkIndicator } from "../LeadLinkIndicator";
import { ClientTypeBadge } from "../ClientTypeBadge";
import { getClientTypeInfo } from "@/utils/clientTypeUtils";
import { useNavigate } from "react-router-dom";
import { updateProject } from "@/server/project-actions";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
  statusOptions: Array<{ value: string; color: string }>;
  onDragStart: (id: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  updatingStatus: string | null;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

export default function ProjectCard({
  project,
  statusOptions,
  onDragStart,
  onStatusChange,
  updatingStatus,
  onProjectDeleted,
  onProjectUpdated,
}: ProjectCardProps) {
  const isUpdating = updatingStatus === project.id;
  const navigate = useNavigate();
  const clientTypeInfo = getClientTypeInfo(project);
  const { toast } = useToast();
  const [isUpdatingProgrammer, setIsUpdatingProgrammer] = useState(false);

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    if (action === 'view') {
      navigate(`/projeto/${projectId}`);
    } else {
      navigate(`/projeto/${projectId}/editar`);
    }
  };

  const handleAssignedProgrammerChange = async (programmer: string | null) => {
    setIsUpdatingProgrammer(true);
    try {
      const result = await updateProject(project.id, {
        assigned_programmer: programmer
      });

      if (result.success) {
        toast({
          title: "Programador atualizado",
          description: `Programador ${programmer ? `atribuído para ${programmer}` : 'removido'} com sucesso.`,
        });
        
        // Refresh the project data
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        throw new Error(result.message || "Erro ao atualizar programador");
      }
    } catch (error) {
      console.error("Erro ao atualizar programador:", error);
      toast({
        title: "Erro ao atualizar programador",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProgrammer(false);
    }
  };

  return (
    <Card className={`p-3 sm:p-4 lg:p-5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 ${clientTypeInfo.borderColor} ${clientTypeInfo.cardBgColor}`}
      draggable
      onDragStart={() => onDragStart(project.id)}
    >
      <div className="space-y-2 sm:space-y-3">
        {/* Top row with programmer assignment and client type badge */}
        <div className="flex justify-between items-start">
          <EditableAssignedProgrammer
            assignedProgrammer={project.assigned_programmer}
            onAssignedProgrammerChange={handleAssignedProgrammerChange}
          />
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
          <div className="pt-1 sm:pt-2">
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
