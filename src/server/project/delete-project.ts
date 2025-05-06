
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";

// Function to delete a project and its related data
export async function deleteProject(id: string) {
  try {
    // First, delete all customizations related to the project
    const { error: customizationsError } = await supabase
      .from('project_customizations')
      .delete()
      .eq('project_id', id);
    
    if (customizationsError) {
      console.error("Erro ao excluir customizações:", customizationsError);
      toast({
        title: "Erro ao excluir customizações",
        description: customizationsError.message,
        variant: "destructive",
      });
      return { success: false, error: customizationsError };
    }
    
    // Then, delete the project
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (projectError) {
      console.error("Erro ao excluir projeto:", projectError);
      toast({
        title: "Erro ao excluir projeto",
        description: projectError.message,
        variant: "destructive",
      });
      return { success: false, error: projectError };
    }
    
    toast({
      title: "Projeto excluído com sucesso",
      description: "O projeto e seus dados relacionados foram removidos.",
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    
    if (error instanceof Error) {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao excluir projeto",
        description: "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
    
    return { success: false, error };
  }
}
