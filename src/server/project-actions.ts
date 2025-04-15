
import { getSupabaseClient } from "@/lib/supabase";
import type { ProjectFormValues } from "@/lib/validation";

// Get a project by ID
export async function getProjectById(id: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in getProjectById:", error);
    throw error;
  }
}

// Update a project
export async function updateProject(id: string, projectData: ProjectFormValues) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id);

    if (error) {
      console.error("Error updating project:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateProject:", error);
    throw error;
  }
}

// Create a new project
export async function createProject(projectData: ProjectFormValues) {
  try {
    const supabase = getSupabaseClient();
    
    // Ensure client_name is provided since it's required by the database
    if (!projectData.client_name) {
      throw new Error("Client name is required");
    }
    
    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select();

    if (error) {
      console.error("Error creating project:", error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteProject:", error);
    throw error;
  }
}
