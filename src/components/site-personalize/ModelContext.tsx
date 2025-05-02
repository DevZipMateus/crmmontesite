
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ModelTemplate } from "@/services/modelTemplateService";

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
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode, baseUrl: string }> = ({ children, baseUrl }) => {
  const [models, setModels] = useState<ModelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Import at function level to avoid circular dependencies
  const { getAllModelTemplates } = require("@/services/modelTemplateService");
  
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
    } finally {
      setLoading(false);
    }
  };

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
