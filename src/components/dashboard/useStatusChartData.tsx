
import { useState, useEffect } from "react";
import { Project } from "@/types/project";

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export function useStatusChartData(projects: Project[]) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([
    { name: "Site Pronto", value: 0, color: "#22c55e" },
    { name: "Criando Site", value: 4, color: "#3b82f6" },
    { name: "Recebido", value: 0, color: "#8b5cf6" },
    { name: "Config. Domínio", value: 0, color: "#f59e0b" },
    { name: "Aguardando DNS", value: 0, color: "#f97316" }
  ]);
  
  useEffect(() => {
    if (projects.length > 0) {
      const statusCount: Record<string, number> = {};
      
      projects.forEach(project => {
        if (statusCount[project.status]) {
          statusCount[project.status]++;
        } else {
          statusCount[project.status] = 1;
        }
      });
      
      setChartData(prevChartData => 
        prevChartData.map(item => ({
          ...item,
          value: statusCount[item.name] || 0
        }))
      );
    }
  }, [projects]);

  return chartData;
}
