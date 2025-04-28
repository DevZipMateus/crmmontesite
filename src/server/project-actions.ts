import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";
import { ProjectFormValues } from "@/components/projeto/ProjectForm";

// Tipo que define a estrutura de um projeto
export interface Project {
  id: string;
  client_name: string; // Garantindo que client_name é obrigatório
  template?: string;
  status?: string;
  created_at?: string;
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string;
  partner_link?: string; // Adicionado o campo partner_link
}

// Função para obter um projeto por ID
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

// Função para criar um novo projeto
export async function createProject(values: ProjectFormValues) {
  try {
    // Verificar se client_name existe e não está vazio
    if (!values.client_name || values.client_name.trim() === '') {
      throw new Error("Nome do cliente é obrigatório");
    }

    // Cria o objeto de dados do projeto com client_name como campo obrigatório
    const projectData = {
      client_name: values.client_name,  // Campo obrigatório
      template: values.template,
      responsible_name: values.responsible_name,
      status: values.status,
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

// Função para atualizar um projeto existente
export async function updateProject(id: string, values: Partial<Project>) {
  try {
    // Garantir que client_name existe se estiver sendo atualizado
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

// Função para excluir um projeto e seus dados relacionados
export async function deleteProject(id: string) {
  try {
    // Primeiro, excluir todas as customizações relacionadas ao projeto
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
    
    // Depois, excluir o projeto
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
