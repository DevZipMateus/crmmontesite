
import { Card } from "@/components/ui/card";
import { Project } from "@/types/project";
import { ProjectCardHeader, ProjectCardDomain, ProjectCardActions } from "./ProjectCardComponents";
import { PartnerIndicator } from "./ProjectCardComponents/PartnerIndicator";
import { isPartnerProject } from "@/server/webhook-service";

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  return (
    <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
      {/* Indicador de projeto de parceiro */}
      {isPartnerProject(project) && project.partner_hash && (
        <PartnerIndicator partnerHash={project.partner_hash} />
      )}
      
      <ProjectCardHeader 
        project={project}
        onUpdate={onUpdate}
      />
      
      <ProjectCardDomain 
        project={project}
        onUpdate={onUpdate}
      />
      
      <ProjectCardActions 
        project={project}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </Card>
  );
}
