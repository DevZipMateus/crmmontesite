
import { useState, useEffect } from "react";
import { getModelTemplateByCustomUrl, getModelTemplateById } from "@/services/modelTemplateService";
import { findModeloByCustomUrl, modelosDisponiveis } from "./modelosData";

interface ModelData {
  id: string;
  name: string;
  description: string;
}

export const useModelFromUrl = (modeloParam: string | undefined) => {
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [modeloDetails, setModeloDetails] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      if (!modeloParam) {
        setModeloSelecionado("modelo1"); // Default model ID
        // Try to get details for default model
        try {
          const staticModelDetails = modelosDisponiveis.find(m => m.id === "modelo1");
          if (staticModelDetails) {
            setModeloDetails({
              id: staticModelDetails.id,
              name: staticModelDetails.name,
              description: staticModelDetails.description
            });
          }
        } catch (err) {
          console.error("Error loading default model details:", err);
        }
        setLoading(false);
        return;
      }
      
      try {
        // First try to find the model in the database by custom URL
        const dbModel = await getModelTemplateByCustomUrl(modeloParam);
        
        if (dbModel) {
          setModeloSelecionado(dbModel.id);
          setModeloDetails({
            id: dbModel.id,
            name: dbModel.name,
            description: dbModel.description
          });
          setLoading(false);
          return;
        }
        
        // If not found in DB, fallback to the static data (for backward compatibility)
        const staticModelId = findModeloByCustomUrl(modeloParam);
        
        if (staticModelId) {
          setModeloSelecionado(staticModelId);
          // Get details from static models
          const staticModelDetails = modelosDisponiveis.find(m => m.id === staticModelId);
          if (staticModelDetails) {
            setModeloDetails({
              id: staticModelDetails.id,
              name: staticModelDetails.name,
              description: staticModelDetails.description
            });
          }
        } else {
          // If still not found, check if the parameter itself is a valid model ID
          const modelExists = modelosDisponiveis.some(m => m.id === modeloParam);
          if (modelExists) {
            setModeloSelecionado(modeloParam);
            // Get details from static models
            const staticModelDetails = modelosDisponiveis.find(m => m.id === modeloParam);
            if (staticModelDetails) {
              setModeloDetails({
                id: staticModelDetails.id,
                name: staticModelDetails.name,
                description: staticModelDetails.description
              });
            }
          } else {
            // As last attempt, try to fetch from database by ID
            try {
              const dbModelById = await getModelTemplateById(modeloParam);
              if (dbModelById) {
                setModeloSelecionado(dbModelById.id);
                setModeloDetails({
                  id: dbModelById.id,
                  name: dbModelById.name,
                  description: dbModelById.description
                });
                return;
              }
            } catch (innerErr) {
              console.log("Not found by ID either:", innerErr);
            }
            
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

  return { modeloSelecionado, modeloDetails, loading, error };
};
