
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelTemplate, updateModelTemplate } from "@/services/modelTemplateService";
import { useModelContext } from "../ModelContext";

export const useModelEdit = () => {
  const { toast } = useToast();
  const { fetchModels, refreshAuth, models } = useModelContext();

  // Edit model dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditModel, setCurrentEditModel] = useState<ModelTemplate | null>(null);
  const [saving, setSaving] = useState(false);

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
    
    // Look up the fresh model data before editing
    try {
      // Find the most up-to-date model from the context
      const freshModel = models.find(m => m.id === model.id);
      
      if (freshModel) {
        console.log("Starting edit with fresh model data:", freshModel);
        setCurrentEditModel(freshModel);
      } else {
        console.log("Model not found in current models list:", model.id);
        setCurrentEditModel(model);
      }
      setEditDialogOpen(true);
    } catch (err) {
      console.error("Error preparing model for editing:", err);
      toast({
        title: "Erro ao preparar modelo",
        description: "Houve um erro ao preparar o modelo para edição. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
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
      console.log("Model ID being sent:", currentEditModel.id);
      
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

  return {
    editDialogOpen,
    setEditDialogOpen,
    currentEditModel,
    setCurrentEditModel,
    saving,
    handleEditClick,
    handleEditModelChange,
    handleSaveEdit
  };
};
