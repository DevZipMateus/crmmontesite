
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomizationForm } from "@/components/projeto/CustomizationForm";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  handleProjectDeleted: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId,
  projectName,
  isDialogOpen,
  setIsDialogOpen,
  handleProjectDeleted,
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={() => navigate('/projetos')}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
        </Button>
      </div>
      
      <div className="flex justify-end gap-2 mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nova Customização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Customização</DialogTitle>
            </DialogHeader>
            <CustomizationForm 
              projectId={projectId} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(`/projeto/${projectId}/editar`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" /> Editar
        </Button>
        
        <DeleteProjectDialog 
          projectId={projectId}
          projectName={projectName}
          onDelete={handleProjectDeleted}
          variant="button"
          size="default"
        />
      </div>
    </>
  );
};
