
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ModelTemplate, getAllModelTemplates } from "@/services/modelTemplateService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

interface ModelContextType {
  models: ModelTemplate[];
  setModels: React.Dispatch<React.SetStateAction<ModelTemplate[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  copied: string | null;
  setCopied: React.Dispatch<React.SetStateAction<string | null>>;
  fetchModels: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode, baseUrl: string }> = ({ children, baseUrl }) => {
  const [models, setModels] = useState<ModelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Import directly at the top level instead of using require
  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getAllModelTemplates();
      setModels(data);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.message || "Falha ao carregar os modelos. Por favor, tente novamente.";
      setError(errorMsg);
      console.error(err);
      
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

export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};
