
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelTemplate, deleteModelTemplate } from "@/services/modelTemplateService";
import { useModelContext } from "../ModelContext";

export const useModelDelete = () => {
  const { toast } = useToast();
  const { fetchModels, refreshAuth } = useModelContext();

  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<ModelTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  
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

  return {
    modelToDelete,
    setModelToDelete,
    deleting,
    confirmDelete,
    handleDeleteModel
  };
};
