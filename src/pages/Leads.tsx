
import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { TopBar } from "@/components/layout/TopBar";
import LeadCard from "@/components/leads/LeadCard";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadMetrics from "@/components/leads/LeadMetrics";
import LeadTableView from "@/components/leads/LeadTableView";
import LeadViewToggle from "@/components/leads/LeadViewToggle";
import LeadPagination from "@/components/leads/LeadPagination";
import LeadEditDialog from "@/components/leads/LeadEditDialog";
import LeadCreateDialog from "@/components/leads/LeadCreateDialog";
import NotificationTestButton from "@/components/NotificationTestButton";
import { AutoLinkingButton } from "@/components/projects/AutoLinkingButton";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import { Lead, LeadFilters as LeadFiltersType, SITUACOES_PADRONIZADAS } from "@/types/lead";

const Leads: React.FC = () => {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: leads = [], isLoading, error, refetch } = useLeads(filters);
  const { mutate: deleteLead } = useDeleteLead();

  const [vendedoresCustomizados, setVendedoresCustomizados] = useState<string[]>([]);
  const vendedores = useMemo(() => {
    const vendedoresDosLeads = [...new Set(leads.map(lead => lead.vendedor).filter(Boolean))];
    const todosVendedores = [...new Set([...vendedoresDosLeads, ...vendedoresCustomizados])];
    return todosVendedores.sort();
  }, [leads, vendedoresCustomizados]);

  const situacoes = [...SITUACOES_PADRONIZADAS];

  const totalPages = Math.ceil(leads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return leads.slice(startIndex, startIndex + pageSize);
  }, [leads, currentPage, pageSize]);

  const handleClearFilters = () => { setFilters({}); setCurrentPage(1); };
  const handleEditLead = (lead: Lead) => { setSelectedLead(lead); setIsEditDialogOpen(true); };
  const handleCreateLead = () => setIsCreateDialogOpen(true);
  const handlePageSizeChange = (newPageSize: number) => { setPageSize(newPageSize); setCurrentPage(1); };
  const handleDeleteLead = (lead: Lead) => deleteLead(lead.id);
  const handleLinkingComplete = () => refetch();
  const handleVendedorAdd = (novoVendedor: string) => {
    if (!vendedoresCustomizados.includes(novoVendedor)) {
      setVendedoresCustomizados(prev => [...prev, novoVendedor]);
    }
  };

  React.useEffect(() => { setCurrentPage(1); }, [filters]);

  if (error) {
    return (
      <PageLayout title="Gestão de Leads">
        <div className="p-6 text-center text-destructive">Erro ao carregar leads. Tente novamente.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gestão de Leads">
      <TopBar
        breadcrumbs={[
          { label: "Início", href: "/home" },
          { label: "Leads" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <NotificationTestButton />
            <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
            <LeadViewToggle view={view} onViewChange={setView} />
            <Button onClick={handleCreateLead} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo lead
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Title */}
        <h1 className="text-2xl font-bold">Gestão de Leads</h1>

        {/* Metrics */}
        <LeadMetrics leads={leads} />

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          vendedores={vendedores}
          situacoes={situacoes}
          onVendedorAdd={handleVendedorAdd}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Carregando leads...</div>
          </div>
        ) : leads.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{paginatedLeads.length}</span> de{' '}
              <span className="font-semibold text-foreground">{leads.length}</span> leads
            </p>
            
            {view === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <LeadTableView 
                  leads={paginatedLeads} 
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paginatedLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={handleEditLead}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            )}

            {leads.length > pageSize && (
              <LeadPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={leads.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground mb-3">Nenhum lead encontrado com os filtros selecionados.</p>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      <LeadEditDialog
        lead={selectedLead}
        isOpen={isEditDialogOpen}
        onClose={() => { setIsEditDialogOpen(false); setSelectedLead(null); }}
        vendedores={vendedores}
      />

      <LeadCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        vendedores={vendedores}
      />
    </PageLayout>
  );
};

export default Leads;
