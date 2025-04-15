
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
