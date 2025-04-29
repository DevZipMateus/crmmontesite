
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
    { name: "Criando Site", value: 0, color: "#3b82f6" },
    { name: "Recebido", value: 0, color: "#8b5cf6" },
    { name: "Config. Domínio", value: 0, color: "#f59e0b" },
    { name: "Aguardando DNS", value: 0, color: "#f97316" }
  ]);
  
  useEffect(() => {
    if (projects && projects.length > 0) {
      console.log("Processando projetos para o gráfico:", projects);
      
      // Inicializa contagem para cada status
      const statusCount: Record<string, number> = {
        "Site Pronto": 0,
        "Criando Site": 0,
        "Recebido": 0,
        "Config. Domínio": 0,
        "Aguardando DNS": 0,
        "Configurando Domínio": 0, // Alias para "Config. Domínio"
        "Em andamento": 0 // Alias para "Criando Site"
      };
      
      // Faz a contagem de cada status
      projects.forEach(project => {
        const status = project.status || "Em andamento";
        
        // Mapeamento de status equivalentes
        let normalizedStatus = status;
        if (status === "Configurando Domínio") normalizedStatus = "Config. Domínio";
        if (status === "Em andamento") normalizedStatus = "Criando Site";
        
        if (statusCount[normalizedStatus] !== undefined) {
          statusCount[normalizedStatus]++;
        } else {
          console.log("Status não mapeado:", status);
          // Para status não mapeados, incluir em "outros"
          statusCount["Recebido"] = (statusCount["Recebido"] || 0) + 1;
        }
      });
      
      console.log("Contagem de status:", statusCount);
      
      // Atualiza dados do gráfico
      setChartData(prevChartData => 
        prevChartData.map(item => {
          // Encontra o valor para este status (usando o nome exato ou o status mapeado)
          const value = statusCount[item.name] || 0;
          return { ...item, value };
        })
      );
    }
  }, [projects]);

  return chartData;
}
