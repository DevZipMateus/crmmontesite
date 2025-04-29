
import React from "react";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface ProjectsAnalysisSectionProps {
  chartData: ChartDataItem[];
}

export function ProjectsAnalysisSection({ chartData }: ProjectsAnalysisSectionProps) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Análise de Projetos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-64">
        <div className="lg:col-span-2">
          <ProjectStatusChart 
            title="Status dos Projetos" 
            data={chartData}
            type="area"
          />
        </div>
        <div className="lg:col-span-1">
          <ProjectStatusChart 
            title="Distribuição de Status" 
            data={chartData}
            type="pie"
          />
        </div>
      </div>
    </>
  );
}
