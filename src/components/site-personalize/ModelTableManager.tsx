
import React, { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ModelTemplate, updateModelTemplate, deleteModelTemplate } from "@/services/modelTemplateService";
import { useModelContext } from "./ModelContext";
import ModelTable from "./ModelTable";
import ModelDialogs from "./ModelDialogs";

interface ModelTableManagerProps {
  baseUrl: string;
}

const ModelTableManager: React.FC<ModelTableManagerProps> = ({ baseUrl }) => {
  const { toast } = useToast();
  const { isAuthenticated, fetchModels } = useModelContext();

  // Edit model dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditModel, setCurrentEditModel] = useState<ModelTemplate | null>(null);
  
  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<ModelTemplate | null>(null);
  
  // Start editing a model
  const handleEditClick = (model: ModelTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para editar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentEditModel(model);
    setEditDialogOpen(true);
  };
  
  // Handle edit model form changes
  const handleEditModelChange = (field: string, value: string) => {
    if (currentEditModel) {
      setCurrentEditModel({
        ...currentEditModel,
        [field]: value,
      });
    }
  };
  
  // Save edited model
  const handleSaveEdit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para editar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEditModel) return;
    
    try {
      await updateModelTemplate(currentEditModel.id, {
        name: currentEditModel.name,
        description: currentEditModel.description,
        image_url: currentEditModel.image_url,
        custom_url: currentEditModel.custom_url
      });
      
      toast({
        title: "Modelo atualizado",
        description: `O modelo "${currentEditModel.name}" foi atualizado com sucesso.`,
      });
      
      setEditDialogOpen(false);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar modelo",
        description: err.message || "Ocorreu um erro ao atualizar o modelo.",
        variant: "destructive",
      });
    }
  };
  
  // Confirm delete model
  const confirmDelete = (model: ModelTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para excluir modelos.",
        variant: "destructive",
      });
      return;
    }
    
    setModelToDelete(model);
  };
  
  // Delete model
  const handleDeleteModel = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação", 
        description: "Você precisa estar autenticado para excluir modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!modelToDelete) return;
    
    try {
      await deleteModelTemplate(modelToDelete.id);
      
      toast({
        title: "Modelo excluído",
        description: `O modelo "${modelToDelete.name}" foi excluído com sucesso.`,
      });
      
      setModelToDelete(null);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir modelo",
        description: err.message || "Ocorreu um erro ao excluir o modelo.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <CardContent>
        <ModelTable 
          baseUrl={baseUrl}
          onEditClick={handleEditClick}
          onDeleteConfirm={confirmDelete}
        />
      </CardContent>
      
      <ModelDialogs
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        currentEditModel={currentEditModel}
        handleEditModelChange={handleEditModelChange}
        handleSaveEdit={handleSaveEdit}
        modelToDelete={modelToDelete}
        setModelToDelete={setModelToDelete}
        handleDeleteModel={handleDeleteModel}
      />
    </>
  );
};

export default ModelTableManager;
