
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";
import { shouldArchiveProject } from "@/utils/businessDays";

interface ProjectFilters {
  statusFilter: string | null;
  responsibleFilter?: string;
  domainFilter?: string;
  dateFromFilter?: Date | null;
  dateToFilter?: Date | null;
  searchQuery?: string;
  showArchived?: boolean;
  tipoServicoFilter?: string | null;
}

export function useProjects(filters: ProjectFilters | string | null = null, searchQuery: string = "") {
  // Para compatibilidade com versões anteriores
  if (typeof filters === 'string') {
    filters = { statusFilter: filters };
  } else if (filters === null) {
    filters = { statusFilter: null };
  }

  const { statusFilter, responsibleFilter = '', domainFilter = '', dateFromFilter = null, dateToFilter = null, showArchived = false, tipoServicoFilter = null } = 
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
        
        let query = supabase.from('projects').select(`
          *,
          tipo_servico,
          site_personalizacoes:personalization_id(email),
          leads:lead_id(tipo_servico)
        `);
        
        // Aplicar filtros ao query
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        if (tipoServicoFilter) {
          query = query.eq('tipo_servico', tipoServicoFilter);
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
        let filteredProjects: any[] = data || [];
        
        // Aplicar filtro de texto de busca cliente-side
        if (actualSearchQuery.trim()) {
          const lowercaseQuery = actualSearchQuery.toLowerCase();
          const digitsOnlyQuery = actualSearchQuery.replace(/\D/g, '');
          filteredProjects = filteredProjects.filter(project => {
            const projectCnpjDigits = project.cnpj?.replace(/\D/g, '') || '';
            const blasterDigits = project.blaster_link?.replace(/\D/g, '') || '';
            return (
              project.client_name?.toLowerCase().includes(lowercaseQuery) ||
              project.template?.toLowerCase().includes(lowercaseQuery) ||
              project.responsible_name?.toLowerCase().includes(lowercaseQuery) ||
              project.email_complementar?.toLowerCase().includes(lowercaseQuery) ||
              project.site_personalizacoes?.email?.toLowerCase().includes(lowercaseQuery) ||
              project.blaster_link?.toLowerCase().includes(lowercaseQuery) ||
              project.domain?.toLowerCase().includes(lowercaseQuery) ||
              project.cnpj?.toLowerCase().includes(lowercaseQuery) ||
              (digitsOnlyQuery.length > 0 && projectCnpjDigits.includes(digitsOnlyQuery)) ||
              (digitsOnlyQuery.length > 0 && blasterDigits.includes(digitsOnlyQuery))
            );
          });
        }
        
        // Adicionar flag de arquivamento e sobrescrever tipo_servico com o do lead vinculado (fonte da verdade)
        const projectsWithArchiveFlag = filteredProjects.map(project => ({
          ...project,
          tipo_servico: project.leads?.tipo_servico || project.tipo_servico,
          isArchived: shouldArchiveProject(project)
        })) as Project[];
        
        // Filtrar projetos baseado na opção showArchived
        const finalProjects = showArchived 
          ? projectsWithArchiveFlag.filter(project => project.isArchived)
          : projectsWithArchiveFlag.filter(project => !project.isArchived);
        
        setProjects(finalProjects);
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
  }, [statusFilter, responsibleFilter, domainFilter, dateFromFilter, dateToFilter, actualSearchQuery, showArchived, tipoServicoFilter]);

  // Realtime: refetch quando qualquer usuário alterar projetos
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`projects-sync-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('[use-projects] Realtime change:', payload.eventType);
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchProjects();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, responsibleFilter, domainFilter, dateFromFilter, dateToFilter, actualSearchQuery, showArchived, tipoServicoFilter]);

  return { projects, setProjects, loading, fetchProjects };
}
