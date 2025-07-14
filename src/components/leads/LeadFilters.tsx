
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { LeadFilters } from "@/types/lead";

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
  vendedores: string[];
  situacoes: string[];
}

const LeadFiltersComponent: React.FC<LeadFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  vendedores,
  situacoes
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={18} />
        <span className="font-medium">Filtros</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="ml-auto"
        >
          <X size={14} className="mr-1" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar empresa..."
            value={filters.empresa || ''}
            onChange={(e) => onFiltersChange({ ...filters, empresa: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.vendedor || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, vendedor: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os vendedores</SelectItem>
            {vendedores.map((vendedor) => (
              <SelectItem key={vendedor} value={vendedor}>
                {vendedor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.situacao || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, situacao: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as situações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as situações</SelectItem>
            {situacoes.map((situacao) => (
              <SelectItem key={situacao} value={situacao}>
                {situacao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.diasSemResposta?.toString() || ''}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            diasSemResposta: value ? parseInt(value) : undefined 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Dias sem resposta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="3">Até 3 dias</SelectItem>
            <SelectItem value="7">Até 7 dias</SelectItem>
            <SelectItem value="14">Até 14 dias</SelectItem>
            <SelectItem value="30">Mais de 14 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeadFiltersComponent;
