
import React from "react";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface ProjectsAnalysisSectionProps {
  chartData: ChartDataItem[];
}

export function ProjectsAnalysisSection({ chartData }: ProjectsAnalysisSectionProps) {
  return (
    <div className="mb-28">
      <h2 className="text-xl font-bold mb-4">Análise de Projetos</h2>
      <div className="w-full h-[350px]">
        <ProjectStatusChart 
          title="Status dos Projetos" 
          data={chartData}
          type="area"
        />
      </div>
    </div>
  );
}
