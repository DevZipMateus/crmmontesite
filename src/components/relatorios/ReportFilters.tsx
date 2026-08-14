import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, CalendarIcon, X } from "lucide-react";
import { LeadFilters, TIPOS_SERVICO_PADRONIZADOS } from "@/types/lead";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
  vendedores: string[];
  situacoes: string[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  vendedores,
  situacoes,
}) => {
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa ou cliente..."
          value={filters.empresa || ""}
          onChange={(e) => onFiltersChange({ ...filters, empresa: e.target.value })}
          className="pl-9 h-10 rounded-lg border-border"
        />
      </div>

      <Select
        value={filters.vendedor || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, vendedor: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="h-10 w-[170px] rounded-lg">
          <SelectValue placeholder="Todos os vendedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os vendedores</SelectItem>
          {vendedores.map((v) => (
            <SelectItem key={v} value={v}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.situacao || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, situacao: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="h-10 w-[165px] rounded-lg">
          <SelectValue placeholder="Todas as situações" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          {situacoes.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tipoServico || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, tipoServico: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="h-10 w-[160px] rounded-lg">
          <SelectValue placeholder="Todos os serviços" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os serviços</SelectItem>
          {TIPOS_SERVICO_PADRONIZADOS.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.faixaDias || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, faixaDias: v === "all" ? undefined : v })}
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-10 rounded-lg gap-1.5", !filters.dataInicio && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {filters.dataInicio ? format(filters.dataInicio, "dd/MM/yy", { locale: ptBR }) : "Data inicial"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dataInicio}
            onSelect={(d) => onFiltersChange({ ...filters, dataInicio: d })}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-10 rounded-lg gap-1.5", !filters.dataFim && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {filters.dataFim ? format(filters.dataFim, "dd/MM/yy", { locale: ptBR }) : "Data final"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dataFim}
            onSelect={(d) => onFiltersChange({ ...filters, dataFim: d })}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10 gap-1.5 text-muted-foreground">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};

export default ReportFilters;
