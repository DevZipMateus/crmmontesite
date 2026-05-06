import React, { useState } from "react";
import { Filter, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_TYPES } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdvancedFiltersProps {
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  responsibleFilter: string;
  setResponsibleFilter: (responsible: string) => void;
  domainFilter: string;
  setDomainFilter: (domain: string) => void;
  dateFromFilter: Date | null;
  setDateFromFilter: (date: Date | null) => void;
  dateToFilter: Date | null;
  setDateToFilter: (date: Date | null) => void;
  onResetFilters: () => void;
}

export default function AdvancedFilters({
  statusFilter,
  setStatusFilter,
  responsibleFilter,
  setResponsibleFilter,
  domainFilter,
  setDomainFilter,
  dateFromFilter,
  setDateFromFilter,
  dateToFilter,
  setDateToFilter,
  onResetFilters,
}: AdvancedFiltersProps) {
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);

  const hasActiveFilters = statusFilter || responsibleFilter || domainFilter || dateFromFilter || dateToFilter;

  return (
    <div className="space-y-3">
      {/* Filter controls row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Status */}
        <div className="space-y-1.5 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-8 text-xs border-border/60">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PROJECT_STATUS_TYPES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsible */}
        <div className="space-y-1.5 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground">Responsavel</label>
          <Input 
            placeholder="Nome" 
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="h-8 text-xs border-border/60"
          />
        </div>

        {/* Domain */}
        <div className="space-y-1.5 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground">Dominio</label>
          <Input 
            placeholder="Dominio" 
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-8 text-xs border-border/60"
          />
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">De</label>
          <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs font-normal w-[120px] justify-start border-border/60">
                <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
                {dateFromFilter ? format(dateFromFilter, "dd/MM/yy") : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFromFilter || undefined}
                onSelect={(date) => { setDateFromFilter(date); setOpenFromDate(false); }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Ate</label>
          <Popover open={openToDate} onOpenChange={setOpenToDate}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs font-normal w-[120px] justify-start border-border/60">
                <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
                {dateToFilter ? format(dateToFilter, "dd/MM/yy") : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateToFilter || undefined}
                onSelect={(date) => { setDateToFilter(date); setOpenToDate(false); }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-8 text-xs text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {statusFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter(null)} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {responsibleFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Responsavel: {responsibleFilter}
              <button onClick={() => setResponsibleFilter("")} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {domainFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Dominio: {domainFilter}
              <button onClick={() => setDomainFilter("")} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {dateFromFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              De: {format(dateFromFilter, "dd/MM/yy")}
              <button onClick={() => setDateFromFilter(null)} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {dateToFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Ate: {format(dateToFilter, "dd/MM/yy")}
              <button onClick={() => setDateToFilter(null)} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
