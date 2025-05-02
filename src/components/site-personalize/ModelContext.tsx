
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { ModelTemplate, getAllModelTemplates } from "@/services/modelTemplateService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { ModelContextType } from "./hooks/useModelContext";

// Create the context with an undefined default value
const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode, baseUrl: string }> = ({ children, baseUrl }) => {
  const [models, setModels] = useState<ModelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getAllModelTemplates();
      setModels(data);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.message || "Falha ao carregar os modelos. Por favor, tente novamente.";
      setError(errorMsg);
      console.error("Error fetching models:", err);
      
      // Check if this is an auth error and try to handle it
      if (errorMsg.includes('autenticado')) {
        setIsAuthenticated(false);
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a function to refresh authentication
  const refreshAuth = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const isLoggedIn = !!session.session || localStorage.getItem('isLoggedIn') === 'true';
      
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        setError("Você precisa estar autenticado para gerenciar modelos.");
      } else {
        // If authenticated, clear any previous auth errors
        if (error?.includes('autenticado')) {
          setError(null);
        }
      }
      
      return isLoggedIn;
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setIsAuthenticated(false);
      setError("Erro ao verificar estado de autenticação.");
      return false;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const checkAuth = async () => {
      await refreshAuth();
    };
    
    checkAuth();
  }, []);

  const value = {
    models,
    setModels,
    loading,
    setLoading,
    error,
    setError,
    isAuthenticated,
    setIsAuthenticated,
    copied,
    setCopied,
    fetchModels,
    refreshAuth
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// Export context directly
export { ModelContext };
