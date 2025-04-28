
import { supabase } from "@/integrations/supabase/client";
import { ProjectCustomization } from "@/types/customization";
import { toast } from "@/components/ui/use-toast";

// Function to get customizations for a project
export async function getProjectCustomizations(projectId: string): Promise<ProjectCustomization[]> {
  try {
    console.log("Fetching customizations for project:", projectId);
    const { data, error } = await supabase
      .from("project_customizations")
      .select("*")
      .eq("project_id", projectId)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error fetching customizations:", error);
      toast({
        title: "Erro ao buscar personalizações",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }

    console.log("Fetched customizations:", data);
    return data as ProjectCustomization[];
  } catch (error) {
    console.error("Error fetching customizations:", error);
    toast({
      title: "Erro ao buscar personalizações",
      description: "Ocorreu um erro ao buscar as personalizações",
      variant: "destructive",
    });
    return [];
  }
}

// Function to add a new customization
export async function addCustomization(customization: Omit<ProjectCustomization, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; data?: ProjectCustomization }> {
  try {
    console.log("Adding customization:", customization);
    const { data, error } = await supabase
      .from("project_customizations")
      .insert(customization)
      .select()
      .single();

    if (error) {
      console.error("Error adding customization:", error);
      toast({
        title: "Erro ao adicionar personalização",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }

    console.log("Added customization:", data);
    toast({
      title: "Personalização adicionada",
      description: "A personalização foi adicionada com sucesso",
    });

    return { success: true, data: data as ProjectCustomization };
  } catch (error) {
    console.error("Error adding customization:", error);
    toast({
      title: "Erro ao adicionar personalização",
      description: "Ocorreu um erro ao adicionar a personalização",
      variant: "destructive",
    });
    return { success: false };
  }
}

// Function to update a customization status
export async function updateCustomizationStatus(
  customizationId: string, 
  status: string,
  completedAt?: string | null
): Promise<{ success: boolean }> {
  try {
    const updateData: Partial<ProjectCustomization> = { status: status as any };
    
    if (status === 'Concluído' && !completedAt) {
      updateData.completed_at = new Date().toISOString();
    } else if (completedAt) {
      updateData.completed_at = completedAt;
    }
    
    console.log("Updating customization status:", { id: customizationId, ...updateData });
    const { error } = await supabase
      .from("project_customizations")
      .update(updateData)
      .eq("id", customizationId);

    if (error) {
      console.error("Error updating customization:", error);
      toast({
        title: "Erro ao atualizar personalização",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }

    console.log("Updated customization status successfully");
    toast({
      title: "Personalização atualizada",
      description: "O status da personalização foi atualizado com sucesso",
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating customization:", error);
    toast({
      title: "Erro ao atualizar personalização",
      description: "Ocorreu um erro ao atualizar a personalização",
      variant: "destructive",
    });
    return { success: false };
  }
}

// Function to delete a customization
export async function deleteCustomization(customizationId: string): Promise<{ success: boolean }> {
  try {
    console.log("Deleting customization:", customizationId);
    const { error } = await supabase
      .from("project_customizations")
      .delete()
      .eq("id", customizationId);

    if (error) {
      console.error("Error deleting customization:", error);
      toast({
        title: "Erro ao excluir personalização",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }

    console.log("Deleted customization successfully");
    toast({
      title: "Personalização excluída",
      description: "A personalização foi excluída com sucesso",
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting customization:", error);
    toast({
      title: "Erro ao excluir personalização", 
      description: "Ocorreu um erro ao excluir a personalização",
      variant: "destructive",
    });
    return { success: false };
  }
}
