
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Edit, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  handleProjectDeleted: () => void;
  personalizationId?: string | null;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId,
  projectName,
  isDialogOpen,
  setIsDialogOpen,
  handleProjectDeleted,
  personalizationId
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/projetos')}
          >
            <ChevronDownIcon className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {personalizationId && (
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/personalizacao/${personalizationId}`)}
          >
            <ExternalLink className="h-4 w-4" /> 
            Ver Personalização
          </Button>
        )}
        
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(`/projeto/${projectId}/editar`)}
        >
          <Edit className="h-4 w-4" /> 
          Editar
        </Button>
        
        <DeleteProjectDialog 
          projectId={projectId}
          projectName={projectName}
          onDelete={handleProjectDeleted}
          variant="button"
          size="default"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.print()}>
              Imprimir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
