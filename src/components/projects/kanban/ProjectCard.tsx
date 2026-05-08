import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { getClientTypeInfo } from "@/utils/clientTypeUtils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, PenSquare, Archive, ArchiveRestore, Clock, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectArchiving } from "@/hooks/use-project-archiving";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArchiveDialog } from "./ProjectCardComponents/ArchiveDialog";

interface ProjectCardProps {
  project: Project;
  statusOptions: Array<{ value: string; color: string }>;
  onDragStart: (id: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  updatingStatus: string | null;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

const programmerColors: Record<string, string> = {
  "Victor": "bg-blue-500",
  "Davi": "bg-purple-500",
  "Erica": "bg-emerald-500",
  "Érica": "bg-emerald-500",
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `ha ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `ha ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
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
  const navigate = useNavigate();
  const clientTypeInfo = getClientTypeInfo(project);
  const { toast } = useToast();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { archiveProject, unarchiveProject, isArchiving } = useProjectArchiving();

  const programmer = project.assigned_programmer || project.responsible_name;
  const programmerInitials = programmer ? programmer.substring(0, 2).toUpperCase() : "?";
  const programmerColor = programmer ? (programmerColors[programmer] || "bg-muted-foreground") : "bg-orange-400";

  const handleArchiveConfirm = async () => {
    const success = project.isArchived
      ? await unarchiveProject(project.id)
      : await archiveProject(project.id);
    if (success && onProjectDeleted) onProjectDeleted();
    setShowArchiveDialog(false);
  };

  // Form status
  const hasForm = project.formulario_preenchido;

  return (
    <Card 
      className={`p-3.5 cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-md border-l-[3px] ${clientTypeInfo.borderColor} bg-card group`}
      draggable
      onDragStart={() => onDragStart(project.id)}
    >
      <div className="space-y-2">
        {/* Row 1: Client name + Form badge + Service type */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight">{project.client_name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {project.tipo_servico && (
              <Badge className={`text-[10px] font-medium gap-1 px-1.5 py-0.5 ${project.tipo_servico === 'Site' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                <Store className="h-3 w-3" />
                {project.tipo_servico === 'Site' ? 'Site' : 'Site + Vitrine'}
              </Badge>
            )}
            {hasForm ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium shrink-0 gap-1 px-1.5 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Form
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-medium shrink-0 gap-1 px-1.5 py-0.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Aguard.
              </Badge>
            )}
          </div>
        </div>

        {/* Row 3: Footer - Avatar + Time + Actions */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className={`text-[10px] text-white font-semibold ${programmerColor}`}>
                {programmerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[11px]">{getTimeAgo(project.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); navigate(`/projeto/${project.id}`); }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); navigate(`/projeto/${project.id}/editar`); }}
            >
              <PenSquare className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); setShowArchiveDialog(true); }}
              disabled={isArchiving}
            >
              {project.isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      <ArchiveDialog
        isOpen={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleArchiveConfirm}
        isArchiving={isArchiving}
        projectName={project.client_name}
        isArchived={!!project.isArchived}
      />
    </Card>
  );
}
