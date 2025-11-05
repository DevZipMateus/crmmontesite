
import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
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
  const [view, setView] = useState<'cards' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: leads = [], isLoading, error, refetch } = useLeads(filters);
  const { mutate: deleteLead } = useDeleteLead();

  // Extrair vendedores únicos para os filtros
  const [vendedoresCustomizados, setVendedoresCustomizados] = useState<string[]>([]);
  const vendedores = useMemo(() => {
    const vendedoresDosLeads = [...new Set(leads.map(lead => lead.vendedor).filter(Boolean))];
    const todosVendedores = [...new Set([...vendedoresDosLeads, ...vendedoresCustomizados])];
    return todosVendedores.sort();
  }, [leads, vendedoresCustomizados]);

  // Converter situações padronizadas para array de strings
  const situacoes = [...SITUACOES_PADRONIZADAS];

  // Paginação
  const totalPages = Math.ceil(leads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return leads.slice(startIndex, endIndex);
  }, [leads, currentPage, pageSize]);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleCreateLead = () => {
    setIsCreateDialogOpen(true);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDeleteLead = (lead: Lead) => {
    deleteLead(lead.id);
  };

  const handleLinkingComplete = () => {
    // Refresh leads after linking
    refetch();
  };

  const handleVendedorAdd = (novoVendedor: string) => {
    if (!vendedoresCustomizados.includes(novoVendedor)) {
      setVendedoresCustomizados(prev => [...prev, novoVendedor]);
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (error) {
    return (
      <PageLayout title="Gestão de Leads">
        <div className="p-6">
          <div className="text-center text-red-600">
            Erro ao carregar leads. Tente novamente.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gestão de Leads">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestão de Leads</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Acompanhe o status dos clientes potenciais e gerencie o funil de vendas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex gap-2 sm:hidden">
              <NotificationTestButton />
              <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <NotificationTestButton />
              <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
              <LeadViewToggle view={view} onViewChange={setView} />
            </div>
            <Button onClick={handleCreateLead} className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <LeadMetrics leads={leads} />

        {/* Filtros */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          vendedores={vendedores}
          situacoes={situacoes}
          onVendedorAdd={handleVendedorAdd}
        />

        {/* Lista de Leads */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Carregando leads...</div>
            </div>
          ) : leads.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {leads.length} lead(s) encontrado(s)
                  {leads.length !== paginatedLeads.length && (
                    <span className="ml-2 text-gray-500">
                      (mostrando {paginatedLeads.length} de {leads.length})
                    </span>
                  )}
                </span>
              </div>
              
              {view === 'table' ? (
                <LeadTableView 
                  leads={paginatedLeads} 
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                Nenhum lead encontrado com os filtros selecionados.
              </div>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Edição */}
      <LeadEditDialog
        lead={selectedLead}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedLead(null);
        }}
        vendedores={vendedores}
      />

      {/* Dialog de Criação */}
      <LeadCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        vendedores={vendedores}
      />
    </PageLayout>
  );
};

export default Leads;
