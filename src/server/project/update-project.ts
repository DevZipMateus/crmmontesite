
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";
import { Project } from "@/types/project";

// Function to update an existing project
export async function updateProject(id: string, values: Partial<Project>) {
  try {
    // Ensure client_name exists if it's being updated
    if (values.client_name !== undefined && (!values.client_name || values.client_name.trim() === '')) {
      throw new Error("Nome do cliente é obrigatório");
    }
    
    console.log("Updating project ID:", id);
    console.log("Update values:", values);
    
    const { data, error } = await supabase
      .from('projects')
      .update(values)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      throw error;
    }
    
    console.log("Project updated successfully:", data);
    
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    
    let errorMessage = "Ocorreu um erro desconhecido.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { success: false, error, message: errorMessage };
  }
}
