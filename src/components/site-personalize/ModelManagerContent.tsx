
import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModelContext } from "./hooks/useModelContext";
import ModelFormManager from "./ModelFormManager";
import ModelTableManager from "./ModelTableManager";
import ModelManagerAuth from "./ModelManagerAuth";
import ModelManagerHelp from "./ModelManagerHelp";
import useAuthenticationCheck from "./AuthenticationCheck";

interface ModelManagerContentProps {
  baseUrl: string;
}

const ModelManagerContent: React.FC<ModelManagerContentProps> = ({ baseUrl }) => {
  const { 
    isAuthenticated, 
    loading, 
    error, 
    fetchModels 
  } = useModelContext();
  
  const { verifyAuthentication } = useAuthenticationCheck();

  useEffect(() => {
    verifyAuthentication();
  }, []);
  
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
          <CardTitle>Modelos Disponíveis</CardTitle>
          <CardDescription>
            Gerencie seus modelos e URLs personalizadas
          </CardDescription>
        </CardHeader>
        
        <ModelFormManager />
        <ModelTableManager baseUrl={baseUrl} />
      </Card>
      
      <ModelManagerHelp />
    </div>
  );
};

export default ModelManagerContent;
