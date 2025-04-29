
import React, { useEffect } from "react";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface ProjectsAnalysisSectionProps {
  chartData: ChartDataItem[];
}

export function ProjectsAnalysisSection({ chartData }: ProjectsAnalysisSectionProps) {
  useEffect(() => {
    console.log("ProjectsAnalysisSection rendering with chart data:", chartData);
  }, [chartData]);

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Análise de Projetos</h2>
      <div className="mb-24">
        <ProjectStatusChart 
          title="Status dos Projetos" 
          data={chartData}
          type="area"
        />
      </div>
    </>
  );
}
