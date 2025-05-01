
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
  const { data, error } = await supabase
    .from('model_templates')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error fetching model templates:", error);
    throw error;
  }
  
  return data || [];
}

export async function getModelTemplateByCustomUrl(customUrl: string): Promise<ModelTemplate | null> {
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
}

export async function createModelTemplate(model: Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ModelTemplate> {
  const { data, error } = await supabase
    .from('model_templates')
    .insert(model)
    .select()
    .single();
    
  if (error) {
    console.error("Error creating model template:", error);
    throw error;
  }
  
  return data;
}

export async function updateModelTemplate(id: string, updates: Partial<ModelTemplate>): Promise<ModelTemplate> {
  const { data, error } = await supabase
    .from('model_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating model template:", error);
    throw error;
  }
  
  return data;
}

export async function deleteModelTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('model_templates')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting model template:", error);
    throw error;
  }
}
