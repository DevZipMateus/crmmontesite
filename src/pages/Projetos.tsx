
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Archive, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle from "@/components/projects/ViewToggle";
import SearchInput from "@/components/projects/SearchInput";
import { AutoLinkingButton } from "@/components/projects/AutoLinkingButton";
import { useProjects } from "@/hooks/use-projects";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDebounce } from "@/hooks/useDebounce";

export default function Projetos() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const navigate = useNavigate();
  
  // Atualização dos filtros para o hook
  const filters = {
    statusFilter,
    responsibleFilter,
    domainFilter,
    dateFromFilter,
    dateToFilter,
    searchQuery,
    showArchived
  };
  
  const { projects, setProjects, loading, fetchProjects } = useProjects(filters);

  const handleNewProject = useCallback(() => {
    navigate('/novo-projeto');
  }, [navigate]);
  
  const debouncedHandleNewProject = useDebounce(handleNewProject, 1000);

  const handleProjectDeleted = () => {
    // Refresh projects after deletion
    fetchProjects();
  };

  const handleProjectUpdated = () => {
    // Refresh projects after update
    fetchProjects();
  };

  const handleLinkingComplete = () => {
    fetchProjects();
  };

  const handleExportCSV = async () => {
    try {
      const { data: allProjects, error } = await supabase
        .from('projects')
        .select('client_name, telefone, lead_id, blaster_link')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar leads associados
      const leadIds = allProjects?.filter(p => p.lead_id).map(p => p.lead_id!) || [];
      let leadsMap: Record<string, { empresa: string; nome_cliente: string }> = {};

      if (leadIds.length > 0) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id, empresa, nome_cliente')
          .in('id', leadIds);
        
        leads?.forEach(l => {
          leadsMap[l.id] = { empresa: l.empresa, nome_cliente: l.nome_cliente };
        });
      }

      const csvRows = [
        ['Nome do Cliente', 'Telefone', 'Link Blaster', 'Lead Associado (Empresa)', 'Lead Associado (Cliente)'].join(','),
        ...(allProjects || []).map(p => {
          const lead = p.lead_id ? leadsMap[p.lead_id] : null;
          return [
            `"${(p.client_name || '').replace(/"/g, '""')}"`,
            `"${(p.telefone || '').replace(/"/g, '""')}"`,
            `"${(p.blaster_link || '').replace(/"/g, '""')}"`,
            `"${(lead?.empresa || '').replace(/"/g, '""')}"`,
            `"${(lead?.nome_cliente || '').replace(/"/g, '""')}"`,
          ].join(',');
        })
      ];

      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projetos_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleFilterChange = (filter: string, value: string | null | Date) => {
    switch (filter) {
      case 'status':
        setStatusFilter(value as string | null);
        break;
      case 'responsible':
        setResponsibleFilter(value as string);
        break;
      case 'domain':
        setDomainFilter(value as string);
        break;
      case 'dateFrom':
        setDateFromFilter(value as Date);
        break;
      case 'dateTo':
        setDateToFilter(value as Date);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageLayout 
        title="Projetos"
        showFooter={false}
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 px-3 lg:px-4 text-sm lg:text-base"
              aria-label={showArchived ? "Mostrar projetos ativos" : "Mostrar projetos arquivados"}
            >
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">{showArchived ? "Ver Ativos" : "Ver Arquivados"}</span>
              <span className="sm:hidden">{showArchived ? "Ativos" : "Arquivo"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 lg:px-4 text-sm lg:text-base"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
            <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button 
              onClick={debouncedHandleNewProject} 
              className="bg-primary shadow-sm flex items-center gap-2 px-3 lg:px-4 text-sm lg:text-base"
              aria-label="Criar novo site"
            >
              <Plus className="h-4 w-4" /> 
              <span className="hidden sm:inline">Novo site</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          <div className="w-full">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Buscar por nome, modelo, responsável, email, CNPJ ou domínio..."
              className="rounded-xl shadow-sm w-full"
            />
          </div>

          <div className="w-full overflow-hidden">
            {viewMode === "kanban" ? (
              <KanbanBoard 
                projects={projects} 
                setProjects={setProjects} 
                onProjectDeleted={handleProjectDeleted}
                onProjectUpdated={handleProjectUpdated}
                searchQuery={searchQuery}
              />
            ) : (
              <ProjectListView 
                projects={projects}
                loading={loading}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onProjectDeleted={handleProjectDeleted}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
