
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
    
    // Create update object with all fields that could be updated
    const updateData: Partial<Project> = {};
    
    // Include all possible fields in the update
    if (values.client_name !== undefined) updateData.client_name = values.client_name;
    if (values.template !== undefined) updateData.template = values.template;
    if (values.status !== undefined) updateData.status = values.status;
    if (values.responsible_name !== undefined) updateData.responsible_name = values.responsible_name;
    if (values.domain !== undefined) updateData.domain = values.domain;
    if (values.client_type !== undefined) updateData.client_type = values.client_type;
    if (values.blaster_link !== undefined) updateData.blaster_link = values.blaster_link;
    if (values.provider_credentials !== undefined) updateData.provider_credentials = values.provider_credentials;
    if (values.assigned_programmer !== undefined) updateData.assigned_programmer = values.assigned_programmer;
    if (values.is_inadimplente !== undefined) updateData.is_inadimplente = values.is_inadimplente;
    if (values.project_link !== undefined) updateData.project_link = values.project_link;
    
    // Handle partner_link only if client_type is being updated
    if (values.client_type !== undefined) {
      if (values.client_type === 'parceiro') {
        updateData.partner_link = values.partner_link;
      } else {
        updateData.partner_link = null;
      }
    }
    
    console.log("Final update data:", updateData);
    
    // Use direct update to avoid RPC type issues
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select('*'); // return array to avoid 406 when 0 rows
    
    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      throw error;
    }

    // If no rows were updated, it could be RLS (not authenticated) or not found
    if (!data || data.length === 0) {
      const { data: sessionData } = await supabase.auth.getSession();
      const isLoggedIn = !!sessionData.session;
      console.warn("Update returned no rows. Logged in:", isLoggedIn);
      const message = isLoggedIn
        ? "Projeto não encontrado ou você não tem permissão para atualizar."
        : "Você precisa estar logado para atualizar projetos.";
      throw new Error(message);
    }

    const updatedProject = data[0];
    console.log("Project updated successfully:", updatedProject);
    
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    
    let errorMessage = "Ocorreu um erro desconhecido.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { success: false, error, message: errorMessage };
  }
}
