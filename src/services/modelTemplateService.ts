
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
      if (error.message.includes('JWT') || error.message.includes('token')) {
        console.error("Authentication error:", error);
        throw new Error("Você precisa estar autenticado para realizar esta operação.");
      }
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
    const { data, error } = await supabase
      .from('model_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error("Error fetching model template by ID:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error("Error in getModelTemplateById:", err);
    throw err;
  }
}

export async function createModelTemplate(model: Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ModelTemplate> {
  try {
    const { data, error } = await supabase
      .from('model_templates')
      .insert(model)
      .select()
      .single();
      
    if (error) {
      if (error.message.includes('JWT') || error.message.includes('token')) {
        console.error("Authentication error:", error);
        throw new Error("Você precisa estar autenticado para criar modelos.");
      }
      console.error("Error creating model template:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error("Error in createModelTemplate:", err);
    throw err;
  }
}

export async function updateModelTemplate(id: string, updates: Partial<ModelTemplate>): Promise<ModelTemplate> {
  try {
    const { data, error } = await supabase
      .from('model_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        throw new Error(`Modelo com ID ${id} não encontrado.`);
      }
      if (error.message.includes('JWT') || error.message.includes('token')) {
        console.error("Authentication error:", error);
        throw new Error("Você precisa estar autenticado para atualizar modelos.");
      }
      console.error("Error updating model template:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error("Error in updateModelTemplate:", err);
    throw err;
  }
}

export async function deleteModelTemplate(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('model_templates')
      .delete()
      .eq('id', id);
      
    if (error) {
      if (error.message.includes('JWT') || error.message.includes('token')) {
        console.error("Authentication error:", error);
        throw new Error("Você precisa estar autenticado para excluir modelos.");
      }
      console.error("Error deleting model template:", error);
      throw error;
    }
  } catch (err) {
    console.error("Error in deleteModelTemplate:", err);
    throw err;
  }
}
