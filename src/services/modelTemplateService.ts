
import { supabase } from "@/lib/supabase/client";

export interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  custom_url?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllModelTemplates(): Promise<ModelTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('model_templates')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching model templates:", error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error("Error in getAllModelTemplates:", err);
    throw err;
  }
}

export async function getModelTemplateByCustomUrl(customUrl: string): Promise<ModelTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('model_templates')
      .select('*')
      .eq('custom_url', customUrl)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error("Error fetching model template by custom URL:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error("Error in getModelTemplateByCustomUrl:", err);
    throw err;
  }
}

export async function getModelTemplateById(id: string): Promise<ModelTemplate | null> {
  try {
    console.log(`Fetching model with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('model_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Using maybeSingle instead of single to handle not finding a record
      
    if (error) {
      console.error("Error fetching model template by ID:", error);
      throw error;
    }
    
    if (!data) {
      console.log(`No model found with ID: ${id}`);
    } else {
      console.log(`Found model with ID: ${id}`, data);
    }
    
    return data;
  } catch (err) {
    console.error(`Error in getModelTemplateById for ID ${id}:`, err);
    throw err;
  }
}

export async function createModelTemplate(model: Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ModelTemplate> {
  try {
    console.log("Creating new model with data:", model);
    
    const { data, error } = await supabase
      .from('model_templates')
      .insert(model)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating model template:", error);
      
      // Check if this is a permission issue
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error("Erro de permissão: Não foi possível criar o modelo. Verifique as permissões do banco de dados.");
      }
      
      throw error;
    }
    
    console.log("Model created successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in createModelTemplate:", err);
    throw err;
  }
}

export async function updateModelTemplate(id: string, updates: Partial<ModelTemplate>): Promise<ModelTemplate> {
  try {
    // Log the update attempt to help with debugging
    console.log(`Attempting to update model with ID: ${id}`, updates);
    
    // First verify the ID format is correct (UUID format check)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error(`ID inválido: ${id} não está no formato UUID correto.`);
    }
    
    // First check if the model exists
    const checkResult = await supabase
      .from('model_templates')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (checkResult.error) {
      console.error(`Error checking model existence: ${checkResult.error.message}`);
      throw new Error(`Erro ao verificar existência do modelo: ${checkResult.error.message}`);
    }
    
    if (!checkResult.data) {
      console.error(`Model with ID ${id} not found during pre-check`);
      throw new Error(`Modelo com ID ${id} não encontrado. Verifique o ID ou atualize a página.`);
    }
    
    const { data, error } = await supabase
      .from('model_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle(); // Using maybeSingle instead of single
      
    if (error) {
      console.error("Error updating model template:", error);
      
      // Check if this is a permission issue
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error("Erro de permissão: Não foi possível atualizar o modelo. Verifique as permissões do banco de dados.");
      }
      
      throw error;
    }
    
    if (!data) {
      throw new Error(`Não foi possível atualizar o modelo com ID ${id}. O modelo não foi encontrado.`);
    }
    
    console.log(`Model with ID ${id} updated successfully:`, data);
    return data;
  } catch (err) {
    console.error("Error in updateModelTemplate:", err);
    throw err;
  }
}

export async function deleteModelTemplate(id: string): Promise<void> {
  try {
    console.log(`Attempting to delete model with ID: ${id}`);
    
    const { error } = await supabase
      .from('model_templates')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting model template:", error);
      
      // Check if this is a permission issue
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error("Erro de permissão: Não foi possível excluir o modelo. Verifique as permissões do banco de dados.");
      }
      
      throw error;
    }
    
    console.log(`Model with ID ${id} deleted successfully`);
  } catch (err) {
    console.error("Error in deleteModelTemplate:", err);
    throw err;
  }
}
