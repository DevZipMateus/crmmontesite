import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Archive, Download, Link2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle from "@/components/projects/ViewToggle";
import SearchInput from "@/components/projects/SearchInput";
import { AutoLinkingButton } from "@/components/projects/AutoLinkingButton";
import { useProjects } from "@/hooks/use-projects";
import { TopBar } from "@/components/layout/TopBar";
import { useDebounce } from "@/hooks/useDebounce";
import { PROJECT_STATUS_TYPES } from "@/lib/supabase/projectStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function Projetos() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [tipoServicoFilter, setTipoServicoFilter] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const filters = {
    statusFilter,
    responsibleFilter,
    domainFilter,
    dateFromFilter,
    dateToFilter,
    searchQuery,
    showArchived,
    tipoServicoFilter
  };
  
  const { projects, setProjects, loading, fetchProjects } = useProjects(filters);

  const handleNewProject = useCallback(() => {
    navigate('/novo-projeto');
  }, [navigate]);
  
  const debouncedHandleNewProject = useDebounce(handleNewProject, 1000);

  const handleProjectDeleted = () => fetchProjects();
  const handleProjectUpdated = () => fetchProjects();
  const handleLinkingComplete = () => fetchProjects();

  const handleExportCSV = async () => {
    try {
      const { data: allProjects, error } = await supabase
        .from('projects')
        .select('client_name, telefone, lead_id, blaster_link')
        .order('created_at', { ascending: false });

      if (error) throw error;

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
        ['Nome do Cliente', 'Telefone', 'Link Blaster', 'Lead (Empresa)', 'Lead (Cliente)'].join(','),
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

  const activeCount = projects?.filter(p => p.status !== "Arquivado").length || 0;

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        breadcrumbs={[
          { label: "Inicio", href: "/home" },
          { label: "Projetos" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="h-8 text-xs gap-1.5"
            >
              <Archive className="h-3.5 w-3.5" />
              Arquivados
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button size="sm" onClick={debouncedHandleNewProject} className="h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Novo projeto
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto space-y-5">
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} projetos ativos · {viewMode === "kanban" ? `${PROJECT_STATUS_TYPES.length} colunas` : `mostrando ${projects.length}`}
            </p>
          </div>

          {/* Search + filter chips row */}
          <div className="flex flex-wrap items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por nome, dominio..."
              className="flex-1 min-w-[200px]"
            />

            {/* Inline filter chips */}
            {statusFilter && (
              <Badge variant="secondary" className="text-xs gap-1.5 pl-2 pr-1 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Filter className="h-3 w-3" />
                Status: {statusFilter}
                <button onClick={() => setStatusFilter(null)} className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {responsibleFilter && (
              <Badge variant="secondary" className="text-xs gap-1.5 pl-2 pr-1 py-1 rounded-full">
                Responsavel: {responsibleFilter}
                <button onClick={() => setResponsibleFilter("")} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Quick filter buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <Select
                value={statusFilter || "all"}
                onValueChange={(v) => setStatusFilter(v === "all" ? null : v)}
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px] border-border/60">
                  <span className="text-primary font-medium">Status: {statusFilter || "Todos"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PROJECT_STATUS_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={tipoServicoFilter || "all"}
                onValueChange={(v) => setTipoServicoFilter(v === "all" ? null : v)}
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[140px] border-border/60">
                  <span className="text-primary font-medium">Servico: {tipoServicoFilter || "Todos"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="Site + Vitrine">Site + Vitrine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
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
      </main>
    </div>
  );
}
