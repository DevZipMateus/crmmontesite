
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createModelTemplate } from "@/services/modelTemplateService";
import { useModelContext } from "./ModelContext";
import ModelForm from "./ModelForm";
import ModelDialogs from "./ModelDialogs";

const ModelFormManager: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, fetchModels } = useModelContext();

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
  const [currentEditModel, setCurrentEditModel] = useState<any>(null);
  
  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<any>(null);
  
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
  
  // Save edited model
  const handleSaveEdit = async () => {
    // Implementation moved to ModelTableManager
  };

  return (
    <>
      <div className="px-6 pb-2">
        <Button onClick={() => setShowNewModelForm(!showNewModelForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showNewModelForm ? "Cancelar" : "Novo Modelo"}
        </Button>
      </div>
      
      {showNewModelForm && (
        <CardContent className="border-t pt-4">
          <ModelForm 
            model={newModel}
            onChange={handleNewModelChange}
            onSubmit={handleCreateModel}
          />
        </CardContent>
      )}
      
      <ModelDialogs
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        currentEditModel={currentEditModel}
        handleEditModelChange={handleEditModelChange}
        handleSaveEdit={() => {}}
        modelToDelete={modelToDelete}
        setModelToDelete={setModelToDelete}
        handleDeleteModel={() => {}}
      />
    </>
  );
};

export default ModelFormManager;
