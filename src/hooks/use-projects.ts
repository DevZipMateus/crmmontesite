
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";

interface ProjectFilters {
  statusFilter: string | null;
  responsibleFilter?: string;
  domainFilter?: string;
  dateFromFilter?: Date | null;
  dateToFilter?: Date | null;
  searchQuery?: string;
}

export function useProjects(filters: ProjectFilters | string | null = null, searchQuery: string = "") {
  // Para compatibilidade com versões anteriores
  if (typeof filters === 'string') {
    filters = { statusFilter: filters };
  } else if (filters === null) {
    filters = { statusFilter: null };
  }

  const { statusFilter, responsibleFilter = '', domainFilter = '', dateFromFilter = null, dateToFilter = null } = 
    (filters as ProjectFilters);
    
  const actualSearchQuery = (filters as ProjectFilters).searchQuery || searchQuery;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      try {
        const supabase = getSupabaseClient();
        
        let query = supabase.from('projects').select('*');
        
        // Aplicar filtros ao query
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        if (responsibleFilter) {
          query = query.ilike('responsible_name', `%${responsibleFilter}%`);
        }
        
        if (domainFilter) {
          query = query.ilike('domain', `%${domainFilter}%`);
        }
        
        // Aplicar filtros de data
        if (dateFromFilter) {
          query = query.gte('created_at', dateFromFilter.toISOString());
        }
        
        if (dateToFilter) {
          // Ajusta para o final do dia
          const endOfDay = new Date(dateToFilter);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.lte('created_at', endOfDay.toISOString());
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched projects:", data);
        let filteredProjects = data || [];
        
        // Aplicar filtro de texto de busca cliente-side
        if (actualSearchQuery.trim()) {
          const lowercaseQuery = actualSearchQuery.toLowerCase();
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
            variant: "destructive"
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, responsibleFilter, domainFilter, dateFromFilter, dateToFilter, actualSearchQuery]);

  return { projects, setProjects, loading, fetchProjects };
}
