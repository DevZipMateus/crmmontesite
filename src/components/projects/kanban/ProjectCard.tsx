
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
import { isPartnerProject } from "@/server/webhook-service";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";

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

  return (
    <Card 
      className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/20 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      style={{ opacity: draggingId === project.id ? 0.5 : 1 }}
    >
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
      
      <div className="mb-2">
        <ProjectCardDomain 
          domain={project.domain}
        />
      </div>
      
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
          onViewEdit={handleViewEdit}
          onProjectDeleted={onProjectDeleted}
        />
      </div>
    </Card>
  );
}
