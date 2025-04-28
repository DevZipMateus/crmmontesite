import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { RecentProjectsCard } from "@/components/dashboard/RecentProjectsCard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useProjects } from "@/hooks/use-projects";
import { useTheme } from "next-themes";
import { ArrowUpRight, Clock, Database, Users } from "lucide-react";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  // Dados para os gráficos
  const chartData = [
    { name: "Site Pronto", value: 0, color: "#22c55e" },
    { name: "Criando Site", value: 0, color: "#3b82f6" },
    { name: "Recebido", value: 0, color: "#8b5cf6" },
    { name: "Config. Domínio", value: 0, color: "#f59e0b" },
    { name: "Aguardando DNS", value: 0, color: "#f97316" }
  ];
  
  // Mock de notificações
  const notifications = [
    {
      id: "1",
      title: "Novo projeto criado",
      description: "O projeto 'Site da Empresa XYZ' foi criado com sucesso.",
      date: "Hoje, 10:30",
      read: false,
      type: "info" as const
    },
    {
      id: "2",
      title: "Projeto aguardando customização",
      description: "O cliente 'ABC Ltda' solicitou customizações.",
      date: "Ontem, 15:45",
      read: true,
      type: "warning" as const
    },
    {
      id: "3",
      title: "Domínio configurado",
      description: "O domínio 'empresa.com.br' foi configurado com sucesso.",
      date: "25/04/2025",
      read: true,
      type: "success" as const
    }
  ];
  
  // Atualiza os dados dos gráficos baseado nos projetos
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
      
      chartData.forEach(item => {
        item.value = statusCount[item.name] || 0;
      });
    }
  }, [projects]);
  
  // Resolver problema de hidratação do tema
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <MainMenuSection />
        <StatsSection />
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        
        {/* Charts and Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProjectStatusChart 
              title="Status dos Projetos" 
              data={chartData}
              type="bar"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationsCard notifications={notifications} />
          <RecentProjectsCard 
            projects={projects.slice(0, 5).map(p => ({
              id: p.id,
              client_name: p.client_name,
              status: p.status,
              created_at: p.created_at,
              template: p.template
            }))} 
          />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
