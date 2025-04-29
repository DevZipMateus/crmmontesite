
import { supabase } from './client';

// Function to ensure consistent status values
export const PROJECT_STATUS_TYPES = [
  { value: "Recebido", icon: "Inbox", color: "bg-purple-500" },
  { value: "Criando site", icon: "Code", color: "bg-blue-500" },
  { value: "Configurando Domínio", icon: "Globe", color: "bg-amber-500" },
  { value: "Aguardando DNS", icon: "Clock", color: "bg-orange-500" },
  { value: "Site pronto", icon: "CheckCircle2", color: "bg-green-500" }
];

// Helper to update project status across the application
export async function updateProjectStatus(projectId: string, newStatus: string) {
  try {
    console.log(`Updating project ${projectId} status to ${newStatus}`);
    
    // Fetch the current status first to have it available for comparison
    const { data: currentProject } = await supabase
      .from('projects')
      .select('status, client_name')
      .eq('id', projectId)
      .single();
    
    const oldStatus = currentProject?.status;
    
    // Update the status
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    
    if (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
    
    console.log(`Project status updated from ${oldStatus} to ${newStatus}`);
    
    return { success: true, oldStatus, newStatus, projectName: currentProject?.client_name };
  } catch (error) {
    console.error('Error updating project status:', error);
    return { success: false, error };
  }
}
