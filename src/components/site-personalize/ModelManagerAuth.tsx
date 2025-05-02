import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useModelContext } from "./hooks/useModelContext";

const ModelManagerAuth: React.FC = () => {
  const { loading, error } = useModelContext();
  
  if (loading) {
    return <div className="flex justify-center py-8">Verificando autenticação...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acesso Restrito</CardTitle>
        <CardDescription>
          Você precisa estar autenticado para gerenciar modelos e URLs personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <p className="text-amber-700">
            Por favor, faça login como administrador para acessar esta funcionalidade.
          </p>
        </div>
        <div className="mt-4">
          <Button onClick={() => window.location.href = "/login"}>
            Ir para página de login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelManagerAuth;
