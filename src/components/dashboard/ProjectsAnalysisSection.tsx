
import React from "react";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface ProjectsAnalysisSectionProps {
  chartData: ChartDataItem[];
}

export function ProjectsAnalysisSection({ chartData }: ProjectsAnalysisSectionProps) {
  return (
    <div className="mb-16">
      <h2 className="text-xl font-bold mb-4">Análise de Projetos</h2>
      <div className="w-full h-[320px]">
        <ProjectStatusChart 
          title="Status dos Projetos" 
          data={chartData}
          type="area"
        />
      </div>
    </div>
  );
}
