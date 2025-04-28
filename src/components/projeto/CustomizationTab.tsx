
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCustomization } from "@/types/customization";
import { getProjectCustomizations } from "@/services/customizationService";
import { CustomizationList } from "@/components/projeto/CustomizationList";
import { CustomizationRequestForm } from "@/components/projeto/CustomizationRequestForm";
import { CustomizationDetail } from "@/components/projeto/CustomizationDetail";
import { updateProjectStatus } from "@/lib/supabase";

interface CustomizationTabProps {
  projectId: string;
  projectStatus: string;
}

export function CustomizationTab({ projectId, projectStatus }: CustomizationTabProps) {
  const [customizations, setCustomizations] = useState<ProjectCustomization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  const loadCustomizations = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectCustomizations(projectId);
      setCustomizations(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomizations();
  }, [projectId]);

  const handleSuccess = async () => {
    await loadCustomizations();
    setShowRequestForm(false);
    
    // Update project status to "Em Customização" if it's not already
    if (projectStatus !== "Em Customização") {
      await updateProjectStatus(projectId, "Em Customização");
    }
  };

  const handleStatusUpdate = () => {
    loadCustomizations();
  };

  const handleDelete = () => {
    loadCustomizations();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Personalizações</h2>
        {!showRequestForm && (
          <Button onClick={() => setShowRequestForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nova Personalização
          </Button>
        )}
      </div>

      {showRequestForm ? (
        <div className="bg-muted/40 p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Solicitar Nova Personalização</h3>
          <CustomizationRequestForm
            projectId={projectId}
            onSuccess={handleSuccess}
          />
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowRequestForm(false)}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : customizations.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="detail">Detalhes</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="pt-4">
            <CustomizationList customizations={customizations} />
          </TabsContent>
          <TabsContent value="detail" className="pt-4">
            <div className="space-y-6">
              {customizations.map((customization) => (
                <CustomizationDetail
                  key={customization.id}
                  customization={customization}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8 bg-muted/40 rounded-lg border">
          {isLoading ? (
            <p>Carregando personalizações...</p>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma personalização solicitada para este projeto ainda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
