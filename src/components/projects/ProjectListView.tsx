
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProjectTable from "./list/ProjectTable";
import AdvancedFilters from "./list/AdvancedFilters";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
}

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
    <>
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
      
      <Card>
        <CardContent className="p-0">
          <ProjectTable 
            projects={projects}
            loading={loading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onProjectDeleted={onProjectDeleted}
          />
        </CardContent>
      </Card>
    </>
  );
}
