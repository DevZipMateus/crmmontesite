
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
    
    const { data, error } = await supabase
      .from('projects')
      .update(values)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Projeto atualizado com sucesso",
      description: "As alterações foram salvas.",
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    
    if (error instanceof Error) {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao atualizar projeto",
        description: "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
    
    return { success: false, error };
  }
}
