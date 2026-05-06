import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, ExternalLink, Edit, MoreHorizontal } from "lucide-react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Badge } from "@/components/ui/badge";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  projectStatus?: string;
  projectType?: string;
  projectModel?: string;
  createdAt?: string;
  responsibleName?: string;
  leadId?: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  handleProjectDeleted: () => void;
  personalizationId?: string | null;
  onExportPDF?: () => void;
}

const statusDotColors: Record<string, string> = {
  "Recebido": "bg-violet-500",
  "Victor": "bg-blue-500",
  "Davi": "bg-amber-500",
  "Sem retorno": "bg-red-500",
  "Site pronto": "bg-emerald-500",
};

const statusTextColors: Record<string, string> = {
  "Recebido": "text-violet-600",
  "Victor": "text-blue-600",
  "Davi": "text-amber-600",
  "Sem retorno": "text-red-600",
  "Site pronto": "text-emerald-600",
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId,
  projectName,
  projectStatus,
  projectType,
  projectModel,
  createdAt,
  responsibleName,
  leadId,
  isDialogOpen,
  setIsDialogOpen,
  handleProjectDeleted,
  personalizationId,
  onExportPDF
}) => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserPermissions();
  const dotColor = statusDotColors[projectStatus || ""] || "bg-muted-foreground";
  const textColor = statusTextColors[projectStatus || ""] || "text-muted-foreground";

  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  
  return (
    <div className="space-y-4">
      {/* Top bar actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projetos')}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-2">
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-1.5 text-xs">
              <FileDown className="h-3.5 w-3.5" />
              Exportar PDF
            </Button>
          )}
          {personalizationId && (
            <Button 
              variant="outline" size="sm"
              onClick={() => navigate(`/personalizacao/${personalizationId}`)}
              className="gap-1.5 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver personalizacao
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isLoading && isAdmin && (
            <Button 
              size="sm"
              onClick={() => navigate(`/projeto/${projectId}/editar`)}
              className="gap-1.5 text-xs"
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Project name + status + lead badge */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">{projectName}</h1>
          {projectStatus && (
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${dotColor}`} />
              <span className={`text-sm font-medium ${textColor}`}>{projectStatus}</span>
            </div>
          )}
          {leadId && (
            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30 bg-primary/5">
              <ExternalLink className="h-3 w-3" />
              Lead vinculado
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {[
            projectType === 'parceiro' ? 'Parceiro' : 'Cliente final',
            projectModel,
            formattedDate ? `Criado em ${formattedDate}` : null,
            responsibleName ? `Responsavel: ${responsibleName}` : null,
          ].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
};
