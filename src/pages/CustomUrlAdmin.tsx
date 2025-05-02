
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomUrlManager from "@/components/site-personalize/CustomUrlManager";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CustomUrlAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for authentication using localStorage
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsAuthenticated(isLoggedIn);
      setLoading(false);
      
      if (isLoggedIn) {
        toast({
          title: "Sessão autenticada",
          description: "Você está autenticado como administrador",
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  const handleLoginClick = () => {
    // Store the current URL so we can redirect back after login
    localStorage.setItem('redirectAfterLogin', '/custom-urls');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Verificando autenticação...</p>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16">
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
                <Button onClick={handleLoginClick}>
                  Ir para página de login
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  // User is authenticated
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/home')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold">Gerenciamento de Modelos e URLs</h1>
          <p className="text-gray-500 mt-1">
            Crie, edite e gerencie modelos de sites e suas URLs personalizadas
          </p>
        </div>

        <div className="mb-8">
          <CustomUrlManager baseUrl={baseUrl} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
