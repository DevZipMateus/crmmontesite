
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomUrlManager from "@/components/site-personalize/CustomUrlManager";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { supabase } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CustomUrlAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST (as recommended in Supabase best practices)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
      
      // If we receive a SIGNED_IN event, make sure we update our state
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setAuthError(null);
      }
    });

    // THEN check for existing session
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setAuthError(error.message);
          setIsAuthenticated(false);
        } else {
          console.log("Current session data:", data);
          setIsAuthenticated(!!data.session);
          if (!data.session) {
            // No active session found
            console.log("No active session found");
            setAuthError("No active session found");
          } else {
            // Session found, user is authenticated
            console.log("User is authenticated:", data.session.user.email);
          }
        }
      } catch (error) {
        console.error("Exception checking auth status:", error);
        setAuthError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    return () => subscription.unsubscribe();
  }, []);

  // Try to force a refresh of auth status when this page loads
  useEffect(() => {
    const refreshAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Error refreshing session:", error);
        } else if (data.session) {
          console.log("Session refreshed successfully");
          setIsAuthenticated(true);
          setAuthError(null);
        }
      } catch (err) {
        console.error("Error during refresh:", err);
      }
    };
    
    refreshAuthStatus();
  }, []);

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
                  {authError && (
                    <span className="block mt-2 text-sm text-red-600">
                      Erro: {authError}
                    </span>
                  )}
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
