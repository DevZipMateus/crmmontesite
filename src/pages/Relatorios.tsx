import React, { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import ReportFilters from "@/components/relatorios/ReportFilters";
import ReportColumnSelector from "@/components/relatorios/ReportColumnSelector";
import ReportSummaryCards from "@/components/relatorios/ReportSummaryCards";
import ReportPreviewTable from "@/components/relatorios/ReportPreviewTable";
import LeadPagination from "@/components/leads/LeadPagination";
import { useLeads } from "@/hooks/useLeads";
import { LeadFilters as LeadFiltersType, SITUACOES_PADRONIZADAS } from "@/types/lead";
import { buildReportRows, DEFAULT_COLUMN_KEYS } from "@/lib/reports/columns";
import { exportReportToCsv, exportReportToXlsx } from "@/lib/reports/export";

const Relatorios: React.FC = () => {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [columnKeys, setColumnKeys] = useState<string[]>(DEFAULT_COLUMN_KEYS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: leads = [], isLoading, error } = useLeads(filters);
  const { data: allLeads = [] } = useLeads();

  const vendedores = useMemo(
    () => [...new Set(allLeads.map((l) => l.vendedor).filter(Boolean))].sort(),
    [allLeads]
  );
  const situacoes = [...SITUACOES_PADRONIZADAS];

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return leads.slice(start, start + pageSize);
  }, [leads, currentPage, pageSize]);

  const handleClearFilters = () => { setFilters({}); setCurrentPage(1); };
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  React.useEffect(() => { setCurrentPage(1); }, [filters]);

  const handleExportXlsx = () => {
    if (leads.length === 0) {
      toast.error("Nenhum lead encontrado para os filtros selecionados.");
      return;
    }
    const rows = buildReportRows(leads, columnKeys);
    exportReportToXlsx(rows, leads);
    toast.success("Relatório Excel gerado com sucesso!");
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast.error("Nenhum lead encontrado para os filtros selecionados.");
      return;
    }
    const rows = buildReportRows(leads, columnKeys);
    exportReportToCsv(rows);
    toast.success("Relatório CSV gerado com sucesso!");
  };

  if (error) {
    return (
      <PageLayout title="Relatórios">
        <div className="text-center text-destructive">Erro ao carregar leads. Tente novamente.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Relatórios"
      breadcrumbs={[
        { label: "Início", href: "/home" },
        { label: "Relatórios" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
          <Button size="sm" onClick={handleExportXlsx} disabled={isLoading}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Exportar Excel
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Relatórios de Leads</h1>
        <p className="text-sm text-muted-foreground">
          Filtre os leads e escolha as colunas para gerar um relatório personalizado em planilha.
        </p>

        <ReportSummaryCards leads={leads} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            vendedores={vendedores}
            situacoes={situacoes}
          />
          <ReportColumnSelector selectedKeys={columnKeys} onChange={setColumnKeys} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Carregando leads...</div>
          </div>
        ) : leads.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{leads.length}</span> leads encontrados com os filtros atuais
            </p>

            <ReportPreviewTable leads={paginatedLeads} columnKeys={columnKeys} />

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
    </PageLayout>
  );
};

export default Relatorios;
