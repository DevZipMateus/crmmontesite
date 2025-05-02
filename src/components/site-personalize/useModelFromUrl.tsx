
import { useState, useEffect } from "react";
import { getModelTemplateByCustomUrl } from "@/services/modelTemplateService";
import { findModeloByCustomUrl, modelosDisponiveis } from "./modelosData";

export const useModelFromUrl = (modeloParam: string | undefined) => {
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      if (!modeloParam) {
        setModeloSelecionado("Modelo 1"); // Default model
        setLoading(false);
        return;
      }
      
      try {
        // First try to find the model in the database by custom URL
        const dbModel = await getModelTemplateByCustomUrl(modeloParam);
        
        if (dbModel) {
          setModeloSelecionado(dbModel.id);
          setLoading(false);
          return;
        }
        
        // If not found in DB, fallback to the static data (for backward compatibility)
        const staticModelId = findModeloByCustomUrl(modeloParam);
        
        if (staticModelId) {
          setModeloSelecionado(staticModelId);
        } else {
          // If still not found, check if the parameter itself is a valid model ID
          const modelExists = modelosDisponiveis.some(m => m.id === modeloParam);
          if (modelExists) {
            setModeloSelecionado(modeloParam);
          } else {
            setError(`Modelo não encontrado: ${modeloParam}`);
          }
        }
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Erro ao carregar modelo. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [modeloParam]);

  return { modeloSelecionado, loading, error };
};
