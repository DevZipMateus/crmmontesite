
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProjectTable from "./list/ProjectTable";
import AdvancedFilters from "./list/AdvancedFilters";
import { Project } from "@/types/project";

interface ProjectListViewProps {
  projects: Project[];
  loading: boolean;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  onProjectDeleted?: () => void;
}

export default function ProjectListView({
  projects,
  loading,
  statusFilter,
  setStatusFilter,
  onProjectDeleted,
}: ProjectListViewProps) {
  // Estado para os novos filtros
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);

  // Função para resetar todos os filtros
  const resetAllFilters = () => {
    setStatusFilter(null);
    setResponsibleFilter("");
    setDomainFilter("");
    setDateFromFilter(null);
    setDateToFilter(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdvancedFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        responsibleFilter={responsibleFilter}
        setResponsibleFilter={setResponsibleFilter}
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        dateFromFilter={dateFromFilter}
        setDateFromFilter={setDateFromFilter}
        dateToFilter={dateToFilter}
        setDateToFilter={setDateToFilter}
        onResetFilters={resetAllFilters}
      />
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ProjectTable 
              projects={projects}
              loading={loading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onProjectDeleted={onProjectDeleted}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
