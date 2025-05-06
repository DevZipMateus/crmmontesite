
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

export async function updateProjectBlasterLink(projectId: string, blasterLink: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ blaster_link: blasterLink })
      .eq('id', projectId);
    
    if (error) {
      console.error('Error updating project blaster link:', error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to update project blaster link:', err);
    throw err;
  }
}

export async function getPersonalizationId(projectId: string): Promise<string | null> {
  try {
    // First check if the project has a personalization_id
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('personalization_id, blaster_link')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      console.error('Error fetching project:', projectError);
      return null;
    }
    
    // If we have a personalization_id, return it
    if (project?.personalization_id) {
      return project.personalization_id;
    }
    
    // For backward compatibility: check if there's a personalization link in blaster_link
    if (project?.blaster_link?.startsWith('personalization:')) {
      const personalizationId = project.blaster_link.replace('personalization:', '');
      
      // Update the project to use the new field for future queries
      try {
        await supabase
          .from('projects')
          .update({ personalization_id: personalizationId })
          .eq('id', projectId);
      } catch (err) {
        console.error('Error updating personalization_id from blaster_link:', err);
        // Continue even if update fails
      }
      
      return personalizationId;
    }
    
    return null;
  } catch (err) {
    console.error('Failed to get personalization ID:', err);
    return null;
  }
}
