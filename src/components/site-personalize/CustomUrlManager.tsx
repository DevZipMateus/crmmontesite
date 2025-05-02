
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModelTemplate, createModelTemplate, updateModelTemplate, deleteModelTemplate } from "@/services/modelTemplateService";
import { ModelProvider, useModelContext } from "./ModelContext";
import ModelForm from "./ModelForm";
import ModelTable from "./ModelTable";
import ModelManagerAuth from "./ModelManagerAuth";
import ModelDialogs from "./ModelDialogs";
import ModelManagerHelp from "./ModelManagerHelp";

interface CustomUrlManagerProps {
  baseUrl: string;
}

const ModelManagerContent: React.FC<{ baseUrl: string }> = ({ baseUrl }) => {
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    error, 
    fetchModels, 
    setLoading, 
    setError 
  } = useModelContext();

  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newModel, setNewModel] = useState<{
    name: string;
    description: string;
    image_url: string;
    custom_url: string;
  }>({
    name: "",
    description: "",
    image_url: "/placeholder.svg",
    custom_url: "",
  });
  
  // Edit model dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditModel, setCurrentEditModel] = useState<ModelTemplate | null>(null);
  
  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<ModelTemplate | null>(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = () => {
    try {
      setLoading(true);
      // Check if user is authenticated using localStorage
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        setIsAuthenticated(true);
        fetchModels();
        toast({
          title: "Sessão autenticada",
          description: "Você está autenticado como administrador",
        });
      } else {
        setIsAuthenticated(false);
        setError("Você precisa estar autenticado para gerenciar modelos.");
      }
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError("Erro ao verificar estado de autenticação.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle new model form changes
  const handleNewModelChange = (field: string, value: string) => {
    setNewModel({
      ...newModel,
      [field]: value,
    });
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
  
  // Submit new model
  const handleCreateModel = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para criar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!newModel.name || !newModel.description) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha o nome e a descrição do modelo.",
          variant: "destructive",
        });
        return;
      }
      
      await createModelTemplate(newModel);
      toast({
        title: "Modelo criado",
        description: `O modelo "${newModel.name}" foi criado com sucesso.`,
      });
      
      // Reset form and refresh models
      setNewModel({
        name: "",
        description: "",
        image_url: "/placeholder.svg",
        custom_url: "",
      });
      setShowNewModelForm(false);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao criar modelo",
        description: err.message || "Ocorreu um erro ao criar o modelo.",
        variant: "destructive",
      });
    }
  };
  
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
  
  if (!isAuthenticated) {
    return <ModelManagerAuth />;
  }
  
  if (loading) {
    return <div className="flex justify-center py-8">Carregando modelos...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="font-medium">Erro</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchModels} 
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Modelos Disponíveis</CardTitle>
              <CardDescription>
                Gerencie seus modelos e URLs personalizadas
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewModelForm(!showNewModelForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showNewModelForm ? "Cancelar" : "Novo Modelo"}
            </Button>
          </div>
        </CardHeader>
        
        {showNewModelForm && (
          <CardContent className="border-t pt-4">
            <ModelForm 
              model={newModel}
              onChange={handleNewModelChange}
              onSubmit={handleCreateModel}
            />
          </CardContent>
        )}
        
        <CardContent className={showNewModelForm ? "" : "pt-0"}>
          <ModelTable 
            baseUrl={baseUrl}
            onEditClick={handleEditClick}
            onDeleteConfirm={confirmDelete}
          />
        </CardContent>
      </Card>
      
      <ModelManagerHelp />
      
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
    </div>
  );
};

const CustomUrlManager: React.FC<CustomUrlManagerProps> = ({ baseUrl }) => {
  return (
    <ModelProvider baseUrl={baseUrl}>
      <ModelManagerContent baseUrl={baseUrl} />
    </ModelProvider>
  );
};

export default CustomUrlManager;
