
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
    const updateData: Partial<Project> = {
      client_name: values.client_name,
      template: values.template,
      status: values.status,
      responsible_name: values.responsible_name,
      domain: values.domain,
      client_type: values.client_type,
      blaster_link: values.blaster_link,
      provider_credentials: values.provider_credentials,
    };
    
    // Only include partner_link if client_type is 'parceiro'
    if (values.client_type === 'parceiro') {
      updateData.partner_link = values.partner_link;
    }
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Project] === undefined) {
        delete updateData[key as keyof Project];
      }
    });
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
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
