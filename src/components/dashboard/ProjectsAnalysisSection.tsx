
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
      <div className="mb-16">
        <ProjectStatusChart 
          title="Status dos Projetos" 
          data={chartData}
          type="area"
        />
      </div>
    </>
  );
}
