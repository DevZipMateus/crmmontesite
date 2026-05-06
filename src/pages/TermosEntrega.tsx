import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, RefreshCw, Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import TermosTable from "@/components/termos-entrega/TermosTable";
import TermoDetailDialog from "@/components/termos-entrega/TermoDetailDialog";
import { getAllProjectsWithTermStatus } from "@/services/deliveryTermService";
import { ProjectWithTermStatus } from "@/types/deliveryTerm";
import { cn } from "@/lib/utils";

const TermosEntrega: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithTermStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTermStatus | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'filled'>('all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjectsWithTermStatus();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleViewDetails = (project: ProjectWithTermStatus) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const stats = {
    total: projects.length,
    filled: projects.filter(p => p.delivery_term).length,
    pending: projects.filter(p => !p.delivery_term).length,
  };

  const filteredProjects = projects.filter(p => {
    if (filterTab === 'pending') return !p.delivery_term;
    if (filterTab === 'filled') return !!p.delivery_term;
    return true;
  });

  const statCards = [
    { label: "Total Enviados", value: stats.total, icon: Send, color: "text-primary", bg: "bg-primary/10" },
    { label: "Preenchidos", value: stats.filled, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const tabs = [
    { key: 'all' as const, label: 'Todos', count: stats.total },
    { key: 'pending' as const, label: 'Pendentes', count: stats.pending },
    { key: 'filled' as const, label: 'Preenchidos', count: stats.filled },
  ];

  return (
    <PageLayout
      title="Revisões / Termos de Entrega"
      showHomeButton={false}
      breadcrumbs={[
        { label: "Início", href: "/home" },
        { label: "Revisões / Termos de Entrega" },
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={fetchProjects} disabled={loading}>
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
          Atualizar
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s, i) => (
            <Card key={i} className="border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`rounded-lg p-2 ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                filterTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{t.count}</Badge>
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileCheck className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">Tudo em dia por aqui</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum termo encontrado nesta categoria.</p>
              </div>
            ) : (
              <TermosTable 
                projects={filteredProjects} 
                onRefresh={fetchProjects}
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TermoDetailDialog
        project={selectedProject}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </PageLayout>
  );
};

export default TermosEntrega;
