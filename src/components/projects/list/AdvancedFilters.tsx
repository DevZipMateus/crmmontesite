
import React, { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface FiltersState {
  status: string | null;
  responsible: string;
  domain: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

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

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-medium">Filtros</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
              <SelectTrigger id="status-filter" className="w-full" aria-label="Filtrar por status">
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
          
          {/* Responsible Filter */}
          <div className="space-y-2">
            <label htmlFor="responsible-filter" className="text-sm font-medium text-gray-700">
              Responsável
            </label>
            <Input 
              id="responsible-filter"
              placeholder="Nome do responsável" 
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              aria-label="Filtrar por responsável"
            />
          </div>
          
          {/* Domain Filter */}
          <div className="space-y-2">
            <label htmlFor="domain-filter" className="text-sm font-medium text-gray-700">
              Domínio
            </label>
            <Input 
              id="domain-filter"
              placeholder="Domínio" 
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              aria-label="Filtrar por domínio"
            />
          </div>
          
          {/* Date From Filter */}
          <div className="space-y-2">
            <label htmlFor="date-from" className="text-sm font-medium text-gray-700">
              Data (de)
            </label>
            <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  aria-label="Filtrar pela data inicial"
                >
                  {dateFromFilter ? (
                    format(dateFromFilter, "dd/MM/yyyy")
                  ) : (
                    <span className="text-muted-foreground">Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFromFilter || undefined}
                  onSelect={(date) => {
                    setDateFromFilter(date);
                    setOpenFromDate(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Date To Filter */}
          <div className="space-y-2">
            <label htmlFor="date-to" className="text-sm font-medium text-gray-700">
              Data (até)
            </label>
            <Popover open={openToDate} onOpenChange={setOpenToDate}>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  aria-label="Filtrar pela data final"
                >
                  {dateToFilter ? (
                    format(dateToFilter, "dd/MM/yyyy")
                  ) : (
                    <span className="text-muted-foreground">Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateToFilter || undefined}
                  onSelect={(date) => {
                    setDateToFilter(date);
                    setOpenToDate(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="text-sm"
            aria-label="Limpar todos os filtros"
          >
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
