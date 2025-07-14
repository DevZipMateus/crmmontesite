
import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import LeadCard from "@/components/leads/LeadCard";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadMetrics from "@/components/leads/LeadMetrics";
import { useLeads } from "@/hooks/useLeads";
import { Lead, LeadFilters as LeadFiltersType } from "@/types/lead";

const Leads: React.FC = () => {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading, error } = useLeads(filters);

  // Extrair vendedores e situações únicas para os filtros
  const vendedores = useMemo(() => {
    const uniqueVendedores = [...new Set(leads.map(lead => lead.vendedor).filter(Boolean))];
    return uniqueVendedores.sort();
  }, [leads]);

  const situacoes = useMemo(() => {
    const uniqueSituacoes = [...new Set(leads.map(lead => lead.situacao))];
    return uniqueSituacoes.sort();
  }, [leads]);

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    // TODO: Implementar modal de edição
    console.log('Editar lead:', lead);
  };

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Leads</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o status dos clientes potenciais e gerencie o funil de vendas
            </p>
          </div>
          <Button>
            <Plus size={18} className="mr-2" />
            Novo Lead
          </Button>
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
        />

        {/* Lista de Leads */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
              ))}
            </div>
          ) : leads.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {leads.length} lead(s) encontrado(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={handleEditLead}
                  />
                ))}
              </div>
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
    </PageLayout>
  );
};

export default Leads;
