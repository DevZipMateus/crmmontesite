
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, Plus, ArrowUpDown, MessageSquare, CalendarIcon } from "lucide-react";
import { LeadFilters } from "@/types/lead";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
  vendedores: string[];
  situacoes: string[];
  onVendedorAdd: (vendedor: string) => void;
}

const LeadFiltersComponent: React.FC<LeadFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  vendedores,
  situacoes,
  onVendedorAdd
}) => {
  const [novoVendedor, setNovoVendedor] = useState("");
  const [showVendedorDialog, setShowVendedorDialog] = useState(false);

  const handleAddVendedor = () => {
    if (novoVendedor.trim()) {
      onVendedorAdd(novoVendedor.trim());
      setNovoVendedor("");
      setShowVendedorDialog(false);
    }
  };

  const activeFilters: { label: string; key: string }[] = [];
  if (filters.vendedor) activeFilters.push({ label: `Vendedor: ${filters.vendedor}`, key: 'vendedor' });
  if (filters.situacao) activeFilters.push({ label: `Situação: ${filters.situacao}`, key: 'situacao' });
  if (filters.faixaDias) activeFilters.push({ label: `Faixa: ${filters.faixaDias}`, key: 'faixaDias' });
  if (filters.comObservacao !== undefined) activeFilters.push({ label: filters.comObservacao ? 'Com observação' : 'Sem observação', key: 'comObservacao' });
  if (filters.dataInicio) activeFilters.push({ label: `De: ${format(filters.dataInicio, "dd/MM/yy")}`, key: 'dataInicio' });
  if (filters.dataFim) activeFilters.push({ label: `Até: ${format(filters.dataFim, "dd/MM/yy")}`, key: 'dataFim' });

  const removeFilter = (key: string) => {
    const updated = { ...filters };
    if (key === 'vendedor') updated.vendedor = undefined;
    if (key === 'situacao') updated.situacao = undefined;
    if (key === 'faixaDias') updated.faixaDias = undefined;
    if (key === 'comObservacao') updated.comObservacao = undefined;
    if (key === 'dataInicio') updated.dataInicio = undefined;
    if (key === 'dataFim') updated.dataFim = undefined;
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa ou cliente..."
            value={filters.empresa || ''}
            onChange={(e) => onFiltersChange({ ...filters, empresa: e.target.value })}
            className="pl-9 h-9"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-1.5">
          <Select
            value={filters.vendedor || 'all'}
            onValueChange={(v) => onFiltersChange({ ...filters, vendedor: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos vendedores</SelectItem>
              {vendedores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>

          <Dialog open={showVendedorDialog} onOpenChange={setShowVendedorDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Adicionar Vendedor</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Nome do vendedor" value={novoVendedor} onChange={(e) => setNovoVendedor(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddVendedor()} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowVendedorDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddVendedor} disabled={!novoVendedor.trim()}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Select
          value={filters.situacao || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, situacao: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas situações</SelectItem>
            {situacoes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={filters.faixaDias || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, faixaDias: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-9 w-[120px] text-xs">
            <SelectValue placeholder="Faixa dias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas faixas</SelectItem>
            <SelectItem value="1-3">1-3 dias</SelectItem>
            <SelectItem value="4-7">4-7 dias</SelectItem>
            <SelectItem value="8-14">8-14 dias</SelectItem>
            <SelectItem value="15-30">15-30 dias</SelectItem>
            <SelectItem value="30+">Mais de 30 dias</SelectItem>
            <SelectItem value="site-pronto">Site Pronto</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.comObservacao === undefined ? 'all' : filters.comObservacao ? 'com' : 'sem'}
          onValueChange={(v) => onFiltersChange({ ...filters, comObservacao: v === 'all' ? undefined : v === 'com' })}
        >
          <SelectTrigger className="h-9 w-[100px] text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Obs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="com">Com obs.</SelectItem>
            <SelectItem value="sem">Sem obs.</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 text-xs", !filters.dataInicio && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {filters.dataInicio ? format(filters.dataInicio, "dd/MM/yy", { locale: ptBR }) : "De"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={filters.dataInicio} onSelect={(d) => onFiltersChange({ ...filters, dataInicio: d })} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 text-xs", !filters.dataFim && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {filters.dataFim ? format(filters.dataFim, "dd/MM/yy", { locale: ptBR }) : "Até"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={filters.dataFim} onSelect={(d) => onFiltersChange({ ...filters, dataFim: d })} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.ordenacao || 'default'}
          onValueChange={(v) => onFiltersChange({ ...filters, ordenacao: v === 'default' ? undefined : v as any })}
        >
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="dias_asc">Dias ↑</SelectItem>
            <SelectItem value="dias_desc">Dias ↓</SelectItem>
            <SelectItem value="asc">Contato ↑</SelectItem>
            <SelectItem value="desc">Contato ↓</SelectItem>
            <SelectItem value="cadastro_asc">Cadastro ↑</SelectItem>
            <SelectItem value="cadastro_desc">Cadastro ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="text-xs gap-1 pl-2 pr-1 py-0.5">
              {f.label}
              <button onClick={() => removeFilter(f.key)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button onClick={onClearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadFiltersComponent;
