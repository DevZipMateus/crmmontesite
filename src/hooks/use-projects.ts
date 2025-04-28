
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string;
  hasPendingCustomizations?: boolean;
}

export function useProjects(statusFilter: string | null, searchQuery: string = "") {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      try {
        const supabase = getSupabaseClient();
        
        let query = supabase.from('projects').select('*');
        
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched projects:", data);
        let filteredProjects = data || [];
        
        // Apply search filter client-side if search query exists
        if (searchQuery.trim()) {
          const lowercaseQuery = searchQuery.toLowerCase();
          filteredProjects = filteredProjects.filter(project => 
            project.client_name?.toLowerCase().includes(lowercaseQuery) || 
            project.template?.toLowerCase().includes(lowercaseQuery) ||
            project.responsible_name?.toLowerCase().includes(lowercaseQuery)
          );
        }
        
        setProjects(filteredProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        
        if (error instanceof Error && !error.message.includes('not initialized')) {
          toast({
            title: "Erro ao buscar projetos",
            description: "Não foi possível carregar a lista de projetos.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchQuery]);

  return { projects, setProjects, loading, fetchProjects };
}
