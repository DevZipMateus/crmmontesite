
import { Card } from "@/components/ui/card";
import { Project } from "@/types/project";
import { 
  ProjectCardHeader, 
  ProjectCardDomain, 
  ProjectCardActions,
  FormStatusIndicator 
} from "./ProjectCardComponents";
import { StatusButtonsGrid } from "./ProjectCardComponents/StatusButtonsGrid";
import { PartnerIndicator } from "./ProjectCardComponents/PartnerIndicator";
import { CustomizationDeadlineIndicator } from "./ProjectCardComponents/CustomizationDeadlineIndicator";
import { ChatButton } from "./ProjectCardComponents/ChatButton";
import { ClientTypeBadge } from "@/components/projects/ClientTypeBadge";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";
import { isPartnerProject } from "@/server/webhook-service";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { getClientTypeInfo } from "@/utils/clientTypeUtils";

interface ProjectCardProps {
  project: Project;
  draggingId: string | null;
  updatingStatus: boolean;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  statusOptions: Array<{value: string; color: string}>;
  onProjectDeleted?: () => void;
}

export default function ProjectCard({ 
  project, 
  draggingId, 
  updatingStatus, 
  onDragStart, 
  onStatusChange, 
  statusOptions, 
  onProjectDeleted 
}: ProjectCardProps) {
  const navigate = useNavigate();
  const clientTypeInfo = getClientTypeInfo(project);

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    if (action === 'view') {
      navigate(`/projeto/${projectId}`);
    } else {
      navigate(`/projeto/${projectId}/editar`);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(project.id, newStatus);
  };

  // Determinar a cor de fundo do card considerando estado arquivado
  const cardBgColor = project.isArchived 
    ? 'bg-gray-50' 
    : clientTypeInfo.cardBgColor;

  return (
    <Card 
      className={`p-0 ${cardBgColor} shadow-sm hover:shadow-md transition-shadow cursor-move overflow-hidden`}
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      style={{ opacity: draggingId === project.id ? 0.5 : 1 }}
    >
      {/* Faixa de tipo de cliente */}
      <ClientTypeBadge project={project} variant="banner" />
      
      <div className="p-3">
        {/* Indicador de projeto arquivado */}
        {project.isArchived && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              <Archive className="h-3 w-3 mr-1" />
              {project.manually_archived ? "Arquivado manualmente" : "Arquivado"}
            </Badge>
          </div>
        )}
        
        {/* Indicador de projeto de parceiro */}
        {isPartnerProject(project) && project.partner_hash && (
          <div className="mb-2">
            <PartnerIndicator partnerHash={project.partner_hash} />
          </div>
        )}
        
        <ProjectCardHeader 
          clientName={project.client_name}
          template={project.modelo_escolhido || project.template}
          hasPendingCustomizations={project.hasPendingCustomizations || false}
          createdAt={project.created_at}
        />
        
        {/* Status do formulário de personalização */}
        {isPartnerProject(project) && (
          <div className="mt-2 mb-2">
            <FormStatusIndicator
              formularioPreenchido={project.formulario_preenchido || false}
              partnerHash={project.partner_hash}
              modeloEscolhido={project.modelo_escolhido}
              dataFormulario={project.data_formulario}
            />
          </div>
        )}
        
        {/* Telefone para projetos de parceiro */}
        {isPartnerProject(project) && project.telefone && (
          <div className="mt-2 mb-2 flex items-center gap-1 text-xs text-gray-600">
            <Phone className="h-3 w-3" />
            <span className="font-medium">{project.telefone}</span>
          </div>
        )}

        {/* Botão de Chat para projetos de parceiro */}
        {isPartnerProject(project) && project.partner_hash && (
          <div className="mt-2 mb-2">
            <ChatButton
              projectId={project.id}
              projectName={project.client_name}
              partnerHash={project.partner_hash}
            />
          </div>
        )}
        
        <div className="mb-2">
          <ProjectCardDomain 
            domain={project.domain}
          />
        </div>
        
        {/* Indicador de prazo de customização */}
        <CustomizationDeadlineIndicator
          status={project.status}
          siteReadyDate={project.site_ready_date}
          customizationDeadline={project.customization_deadline}
          requiresPaidCustomization={project.requires_paid_customization}
        />
        
        {/* Botões de mudança de status */}
        <div className="mb-3 border-t border-gray-100 pt-2">
          <div className="text-xs text-gray-500 mb-1.5 font-medium">Alterar status:</div>
          <StatusButtonsGrid
            currentStatus={project.status}
            statusOptions={statusOptions}
            updatingStatus={updatingStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
        
        {/* Ações do projeto */}
        <div className="border-t border-gray-100 pt-2">
          <ProjectCardActions 
            projectId={project.id}
            projectName={project.client_name}
            isArchived={project.isArchived}
            onViewEdit={handleViewEdit}
            onProjectDeleted={onProjectDeleted}
          />
        </div>
      </div>
    </Card>
  );
}
