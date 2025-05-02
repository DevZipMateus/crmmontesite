
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
  const { isAuthenticated, fetchModels, refreshAuth } = useModelContext();

  // Edit model dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditModel, setCurrentEditModel] = useState<ModelTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<ModelTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Start editing a model
  const handleEditClick = async (model: ModelTemplate) => {
    // Verify authentication first
    const authStatus = await refreshAuth();
    
    if (!authStatus) {
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
    // First verify authentication
    const authStatus = await refreshAuth();
    
    if (!authStatus) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para editar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEditModel) return;
    
    try {
      setSaving(true);
      console.log("Sending update for model:", currentEditModel);
      
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
      await fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar modelo",
        description: err.message || "Ocorreu um erro ao atualizar o modelo.",
        variant: "destructive",
      });
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };
  
  // Confirm delete model
  const confirmDelete = async (model: ModelTemplate) => {
    // Verify authentication first
    const authStatus = await refreshAuth();
    
    if (!authStatus) {
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
    // First verify authentication
    const authStatus = await refreshAuth();
    
    if (!authStatus) {
      toast({
        title: "Erro de autenticação", 
        description: "Você precisa estar autenticado para excluir modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!modelToDelete) return;
    
    try {
      setDeleting(true);
      await deleteModelTemplate(modelToDelete.id);
      
      toast({
        title: "Modelo excluído",
        description: `O modelo "${modelToDelete.name}" foi excluído com sucesso.`,
      });
      
      setModelToDelete(null);
      await fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir modelo",
        description: err.message || "Ocorreu um erro ao excluir o modelo.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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
        saving={saving}
        deleting={deleting}
      />
    </>
  );
};

export default ModelTableManager;
