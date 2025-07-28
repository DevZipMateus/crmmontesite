
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";

// Function to delete a project and its related data
export async function deleteProject(id: string) {
  try {
    // First, check for dependencies
    const { data: linkedLeads, error: leadsCheckError } = await supabase
      .from('leads')
      .select('id, empresa')
      .eq('project_id', id);
    
    if (leadsCheckError) {
      console.error("Erro ao verificar leads vinculados:", leadsCheckError);
      toast({
        title: "Erro ao verificar dependências",
        description: leadsCheckError.message,
        variant: "destructive",
      });
      return { success: false, error: leadsCheckError };
    }

    // Check for webhook logs
    const { data: webhookLogs, error: webhookCheckError } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('project_id', id);
    
    if (webhookCheckError) {
      console.error("Erro ao verificar webhook logs:", webhookCheckError);
      toast({
        title: "Erro ao verificar webhook logs",
        description: webhookCheckError.message,
        variant: "destructive",
      });
      return { success: false, error: webhookCheckError };
    }

    // Step 1: Unlink leads (set project_id to NULL)
    if (linkedLeads && linkedLeads.length > 0) {
      const { error: unlinkLeadsError } = await supabase
        .from('leads')
        .update({ project_id: null, link_confidence_score: null, link_method: null })
        .eq('project_id', id);
      
      if (unlinkLeadsError) {
        console.error("Erro ao desvincular leads:", unlinkLeadsError);
        toast({
          title: "Erro ao desvincular leads",
          description: unlinkLeadsError.message,
          variant: "destructive",
        });
        return { success: false, error: unlinkLeadsError };
      }
    }

    // Step 2: Delete webhook logs
    if (webhookLogs && webhookLogs.length > 0) {
      const { error: webhookDeleteError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('project_id', id);
      
      if (webhookDeleteError) {
        console.error("Erro ao excluir webhook logs:", webhookDeleteError);
        toast({
          title: "Erro ao excluir webhook logs",
          description: webhookDeleteError.message,
          variant: "destructive",
        });
        return { success: false, error: webhookDeleteError };
      }
    }
    
    // Step 3: Delete all customizations related to the project
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
    
    // Step 4: Finally, delete the project
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
    
    let successMessage = "O projeto foi excluído com sucesso.";
    if (linkedLeads && linkedLeads.length > 0) {
      successMessage += ` ${linkedLeads.length} lead(s) foram desvinculados.`;
    }
    
    toast({
      title: "Projeto excluído com sucesso",
      description: successMessage,
    });
    
    return { 
      success: true, 
      unlinkedLeads: linkedLeads ? linkedLeads.length : 0,
      deletedWebhookLogs: webhookLogs ? webhookLogs.length : 0
    };
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
