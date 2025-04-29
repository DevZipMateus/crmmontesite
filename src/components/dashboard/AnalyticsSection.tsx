
import React from "react";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { Clock, Database, Users } from "lucide-react";
import { Project } from "@/hooks/use-projects";

interface AnalyticsSectionProps {
  projects: Project[];
}

export function AnalyticsSection({ projects }: AnalyticsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <AnalyticsCard
        title="Total de Projetos"
        value={projects.length}
        description="Todos os projetos cadastrados"
        icon={<Database className="h-4 w-4" />}
        trend={{ value: 12, isPositive: true }}
      />
      <AnalyticsCard
        title="Projetos Ativos"
        value={projects.filter(p => p.status !== "Site Pronto").length}
        description="Projetos em andamento"
        icon={<Clock className="h-4 w-4" />}
        trend={{ value: 5, isPositive: true }}
      />
      <AnalyticsCard
        title="Clientes"
        value={new Set(projects.map(p => p.client_name)).size}
        description="Clientes únicos"
        icon={<Users className="h-4 w-4" />}
        trend={{ value: 3, isPositive: true }}
      />
    </div>
  );
}
