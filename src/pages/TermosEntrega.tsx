import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import TermosTable from "@/components/termos-entrega/TermosTable";
import TermoDetailDialog from "@/components/termos-entrega/TermoDetailDialog";
import { getAllProjectsWithTermStatus } from "@/services/deliveryTermService";
import { ProjectWithTermStatus } from "@/types/deliveryTerm";

const TermosEntrega: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithTermStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTermStatus | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleViewDetails = (project: ProjectWithTermStatus) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const stats = {
    total: projects.length,
    filled: projects.filter(p => p.delivery_term).length,
    pending: projects.filter(p => !p.delivery_term).length,
  };

  return (
    <PageLayout title="Termos de Entrega" showHomeButton={false}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileCheck className="h-6 w-6" />
                Termos de Entrega
              </h1>
              <p className="text-muted-foreground">
                Gerenciar termos de aceite e entrega de websites
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchProjects} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Projetos</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Termos Preenchidos</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.filled}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos</CardTitle>
            <CardDescription>
              Gere links para os clientes preencherem o termo de aceite
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TermosTable 
                projects={projects} 
                onRefresh={fetchProjects}
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <TermoDetailDialog
          project={selectedProject}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      </div>
    </PageLayout>
  );
};

export default TermosEntrega;
