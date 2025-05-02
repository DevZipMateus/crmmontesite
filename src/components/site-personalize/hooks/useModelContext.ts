
import { useContext } from "react";
import { ModelTemplate } from "@/services/modelTemplateService";
import { ModelContext } from "../ModelContext";

// Define the ModelContextType to match the one in ModelContext.tsx
export interface ModelContextType {
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
  refreshAuth: () => Promise<boolean>;
}

/**
 * Custom hook to access the ModelContext with proper TypeScript typing and error handling
 * @returns The ModelContext values
 * @throws Error if used outside of ModelProvider
 */
export const useModelContext = (): ModelContextType => {
  const context = useContext(ModelContext);
  
  if (context === undefined) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  
  return context;
};
