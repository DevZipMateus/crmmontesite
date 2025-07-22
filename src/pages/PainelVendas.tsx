
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, User, Globe } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

const PainelVendas: React.FC = () => {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <PageLayout title="Painel de Vendas">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Painel de Vendas" showHomeButton={true}>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Vendas</h1>
          <p className="text-muted-foreground">
            Visualização somente leitura dos projetos para equipe de vendas
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">
                Não há projetos disponíveis para visualização no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {project.nome_cliente}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {project.modelo || "Modelo não especificado"}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        project.status === "Concluído" ? "default" :
                        project.status === "Em Produção" ? "secondary" :
                        project.status === "Aguardando Cliente" ? "outline" : "destructive"
                      }
                      className="ml-2"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Responsável: {project.responsavel || "Não atribuído"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {project.dominio && (
                    <div className="text-sm">
                      <span className="font-medium">Domínio: </span>
                      <span className="text-primary">{project.dominio}</span>
                    </div>
                  )}
                  
                  {project.sobre_empresa && (
                    <div className="text-sm">
                      <span className="font-medium">Sobre: </span>
                      <p className="text-muted-foreground line-clamp-2 mt-1">
                        {project.sobre_empresa}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PainelVendas;
