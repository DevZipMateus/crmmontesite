
import { ModelTemplate, getModelTemplateById, getModelTemplateByCustomUrl } from "@/services/modelTemplateService";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";

/**
 * Gets model name from template ID or custom URL
 * @param templateId Template ID or custom URL
 * @returns The model name or fallback value
 */
export async function getModelNameById(templateId?: string): Promise<string> {
  if (!templateId) return '—';
  
  try {
    // First attempt to get model from database by ID
    const dbModel = await getModelTemplateById(templateId);
    if (dbModel) {
      return dbModel.name;
    }
    
    // If not found by ID, try to get by custom URL
    const customUrlModel = await getModelTemplateByCustomUrl(templateId);
    if (customUrlModel) {
      return customUrlModel.name;
    }
    
    // If still not found, check static models data
    const staticModel = modelosDisponiveis.find(
      model => model.id === templateId || model.customUrl === templateId
    );
    if (staticModel) {
      return staticModel.name;
    }
    
    // If we can't find a proper name, return the ID as fallback
    return templateId;
  } catch (error) {
    console.error("Error fetching model name:", error);
    // Return the templateId as fallback in case of error
    return templateId;
  }
}

/**
 * Hook for fetching model details with loading state
 */
export function useModelDetails(templateId?: string) {
  const [modelName, setModelName] = React.useState<string>('—');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchModelName() {
      if (!templateId) {
        setModelName('—');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const name = await getModelNameById(templateId);
        setModelName(name);
      } catch (err) {
        console.error("Error in useModelDetails:", err);
        setError("Não foi possível carregar os detalhes do modelo");
        setModelName(templateId); // Fallback to ID on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchModelName();
  }, [templateId]);

  return { modelName, isLoading, error };
}
