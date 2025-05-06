
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";
import { Project } from "@/types/project";

// Function to get a project by ID
export async function getProjectById(id: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar projeto:", error);
      toast({
        title: "Erro ao buscar projeto",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    
    return data as Project;
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    
    if (error instanceof Error) {
      toast({
        title: "Erro ao buscar projeto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao buscar projeto",
        description: "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
    
    throw error;
  }
}
