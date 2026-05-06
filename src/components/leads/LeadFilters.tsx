
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, MessageSquare, CalendarIcon } from "lucide-react";
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[250px] max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa, cliente, e-mail..."
          value={filters.empresa || ''}
          onChange={(e) => onFiltersChange({ ...filters, empresa: e.target.value })}
          className="pl-9 h-10 rounded-lg border-border"
        />
      </div>

      {/* Vendedor */}
      <div className="flex items-center gap-1">
        <Select
          value={filters.vendedor || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, vendedor: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-10 w-[170px] rounded-lg">
            <SelectValue placeholder="Todos os vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {vendedores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>

        <Dialog open={showVendedorDialog} onOpenChange={setShowVendedorDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Plus className="h-4 w-4" />
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

      {/* Situação */}
      <Select
        value={filters.situacao || 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, situacao: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-10 w-[165px] rounded-lg">
          <SelectValue placeholder="Todas as situações" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          {situacoes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Faixa */}
      <Select
        value={filters.faixaDias || 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, faixaDias: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-10 w-[150px] rounded-lg">
          <SelectValue placeholder="Todas as faixas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as faixas</SelectItem>
          <SelectItem value="1-3">1-3 dias</SelectItem>
          <SelectItem value="4-7">4-7 dias</SelectItem>
          <SelectItem value="8-14">8-14 dias</SelectItem>
          <SelectItem value="15-30">15-30 dias</SelectItem>
          <SelectItem value="30+">Mais de 30 dias</SelectItem>
          <SelectItem value="site-pronto">Site Pronto</SelectItem>
        </SelectContent>
      </Select>

      {/* Período */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-10 rounded-lg gap-1.5", !filters.dataInicio && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {filters.dataInicio ? format(filters.dataInicio, "dd/MM/yy", { locale: ptBR }) : "Período"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={filters.dataInicio} onSelect={(d) => onFiltersChange({ ...filters, dataInicio: d })} initialFocus className="pointer-events-auto" />
        </PopoverContent>
      </Popover>

      {/* Comment filter icon */}
      <Button
        variant={filters.comObservacao !== undefined ? "default" : "ghost"}
        size="icon"
        className="h-10 w-10"
        onClick={() => {
          if (filters.comObservacao === undefined) {
            onFiltersChange({ ...filters, comObservacao: true });
          } else if (filters.comObservacao === true) {
            onFiltersChange({ ...filters, comObservacao: false });
          } else {
            onFiltersChange({ ...filters, comObservacao: undefined });
          }
        }}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LeadFiltersComponent;
