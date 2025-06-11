
import { Card } from "@/components/ui/card";
import { Project } from "@/types/project";
import { 
  ProjectCardHeader, 
  ProjectCardDomain, 
  ProjectCardActions,
  FormStatusIndicator 
} from "./ProjectCardComponents";
import { PartnerIndicator } from "./ProjectCardComponents/PartnerIndicator";
import { isPartnerProject } from "@/server/webhook-service";
import { useNavigate } from "react-router-dom";

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

  return (
    <Card 
      className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/20 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      style={{ opacity: draggingId === project.id ? 0.5 : 1 }}
    >
      {/* Indicador de projeto de parceiro */}
      {isPartnerProject(project) && project.partner_hash && (
        <PartnerIndicator partnerHash={project.partner_hash} />
      )}
      
      <ProjectCardHeader 
        clientName={project.client_name}
        template={project.modelo_escolhido || project.template}
        hasPendingCustomizations={project.hasPendingCustomizations || false}
        createdAt={project.created_at}
      />
      
      {/* Status do formulário de personalização */}
      {isPartnerProject(project) && (
        <div className="mt-3">
          <FormStatusIndicator
            formularioPreenchido={project.formulario_preenchido || false}
            partnerHash={project.partner_hash}
            modeloEscolhido={project.modelo_escolhido}
            dataFormulario={project.data_formulario}
          />
        </div>
      )}
      
      {/* Email complementar (se houver) */}
      {project.email_complementar && (
        <div className="mt-2 text-xs text-gray-600">
          Email adicional: <span className="font-medium">{project.email_complementar}</span>
        </div>
      )}
      
      <ProjectCardDomain 
        domain={project.domain}
      />
      
      <ProjectCardActions 
        projectId={project.id}
        projectName={project.client_name}
        onViewEdit={handleViewEdit}
        onProjectDeleted={onProjectDeleted}
      />
    </Card>
  );
}
