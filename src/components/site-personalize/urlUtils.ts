
import { ModelTemplate } from "@/services/modelTemplateService";

/**
 * Utility for generating and managing URLs for model templates
 */
export const urlUtils = {
  /**
   * Generate a complete URL for a model based on its ID or custom URL
   */
  getFullUrl: (model: ModelTemplate, baseUrl: string): string => {
    const urlParam = model.custom_url || model.id;
    return `${baseUrl}/formulario/${urlParam}`;
  },
  
  /**
   * Find a model by its custom URL
   */
  findModelByCustomUrl: (models: ModelTemplate[], customUrl: string): ModelTemplate | undefined => {
    return models.find(model => model.custom_url === customUrl);
  },
  
  /**
   * Check if a custom URL is unique among all models
   */
  isUniqueCustomUrl: (models: ModelTemplate[], customUrl: string, excludeId?: string): boolean => {
    if (!customUrl) return true; // Empty URLs are always "unique"
    return !models.some(model => model.custom_url === customUrl && model.id !== excludeId);
  }
};
