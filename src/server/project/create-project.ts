
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";
import { ProjectFormValues } from "@/components/projeto/ProjectForm";

// Function to create a new project
export async function createProject(values: ProjectFormValues) {
  try {
    // Check if client_name exists and is not empty
    if (!values.client_name || values.client_name.trim() === '') {
      throw new Error("Nome do cliente é obrigatório");
    }

    // Create project data object with client_name as required field
    const projectData = {
      client_name: values.client_name,  // Required field
      template: values.template || 'Não especificado', // Ensure template is not undefined
      responsible_name: values.responsible_name,
      status: values.status || 'Recebido', // Ensure status is not undefined
      domain: values.domain || null,
      client_type: values.client_type,
      blaster_link: values.blaster_link || null
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select();
    
    if (error) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Projeto criado com sucesso",
      description: `O projeto para ${values.client_name} foi criado.`,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    
    if (error instanceof Error) {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao criar projeto",
        description: "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
    
    return { success: false, error };
  }
}
