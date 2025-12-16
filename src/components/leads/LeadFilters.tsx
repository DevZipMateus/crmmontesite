
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, Plus, ArrowUpDown, MessageSquare, CalendarIcon } from "lucide-react";
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
    <div className="bg-card border rounded-lg p-3 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span className="font-medium">Filtros</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="w-full sm:w-auto"
        >
          <X size={14} className="mr-1" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar empresa ou cliente..."
              value={filters.empresa || ''}
              onChange={(e) => onFiltersChange({ ...filters, empresa: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={filters.vendedor || 'all'}
              onValueChange={(value) => onFiltersChange({ ...filters, vendedor: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={showVendedorDialog} onOpenChange={setShowVendedorDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="px-3 flex-shrink-0">
                <Plus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Vendedor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Nome do vendedor"
                  value={novoVendedor}
                  onChange={(e) => setNovoVendedor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddVendedor()}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowVendedorDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddVendedor} disabled={!novoVendedor.trim()}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Select
          value={filters.situacao || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, situacao: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Situações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            {situacoes.map((situacao) => (
              <SelectItem key={situacao} value={situacao}>
                {situacao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.faixaDias || 'all'}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            faixaDias: value === 'all' ? undefined : value
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Faixa de dias" />
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

        <Select
          value={filters.comObservacao === undefined ? 'all' : filters.comObservacao ? 'com' : 'sem'}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            comObservacao: value === 'all' ? undefined : value === 'com'
          })}
        >
          <SelectTrigger>
            <MessageSquare size={16} className="mr-2 flex-shrink-0" />
            <SelectValue placeholder="Obs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="com">Com observação</SelectItem>
            <SelectItem value="sem">Sem observação</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !filters.dataInicio && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dataInicio ? (
                format(filters.dataInicio, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Cadastro De</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dataInicio}
              onSelect={(date) => onFiltersChange({ ...filters, dataInicio: date })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !filters.dataFim && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dataFim ? (
                format(filters.dataFim, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Cadastro Até</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dataFim}
              onSelect={(date) => onFiltersChange({ ...filters, dataFim: date })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.ordenacao || 'default'}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            ordenacao: value === 'default' ? undefined : value as any
          })}
        >
          <SelectTrigger>
            <ArrowUpDown size={16} className="mr-2 flex-shrink-0" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="dias_asc">Dias s/ Contato ↑</SelectItem>
            <SelectItem value="dias_desc">Dias s/ Contato ↓</SelectItem>
            <SelectItem value="asc">Último Contato ↑</SelectItem>
            <SelectItem value="desc">Último Contato ↓</SelectItem>
            <SelectItem value="cadastro_asc">Data Cadastro ↑</SelectItem>
            <SelectItem value="cadastro_desc">Data Cadastro ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeadFiltersComponent;
