import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Edit, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InadimplentProject {
  id: string;
  client_name: string;
  status: string;
  created_at: string;
  domain?: string;
  hostinger_link?: string;
  blaster_link?: string;
  payment_date?: string;
}

const ProjetosInadimplentes = () => {
  const [selectedProject, setSelectedProject] = useState<InadimplentProject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    domain: "",
    hostinger_link: "",
    blaster_link: "",
    payment_date: ""
  });

  const queryClient = useQueryClient();

  // Buscar projetos inadimplentes (sem domínio ou com status específico)
  const { data: projects, isLoading } = useQuery({
    queryKey: ["inadimplent-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or("domain.is.null,status.eq.Aguardando pagamento")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InadimplentProject[];
    }
  });

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<InadimplentProject> }) => {
      const { error } = await supabase
        .from("projects")
        .update(updates.data)
        .eq("id", updates.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Projeto atualizado",
        description: "As informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["inadimplent-projects"] });
      setIsDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (project: InadimplentProject) => {
    setSelectedProject(project);
    setFormData({
      domain: project.domain || "",
      hostinger_link: project.hostinger_link || "",
      blaster_link: project.blaster_link || "",
      payment_date: project.payment_date || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedProject) return;

    const updates: Partial<InadimplentProject> = {};
    if (formData.domain) updates.domain = formData.domain;
    if (formData.hostinger_link) updates.hostinger_link = formData.hostinger_link;
    if (formData.blaster_link) updates.blaster_link = formData.blaster_link;
    if (formData.payment_date) updates.payment_date = formData.payment_date;

    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: updates
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Aguardando pagamento": "destructive",
      "Em andamento": "secondary",
      "Recebido": "outline",
      "default": "default"
    };

    return (
      <Badge variant={variants[status] || variants.default}>
        {status}
      </Badge>
    );
  };

  return (
    <PageLayout title="Projetos Inadimplentes">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h1 className="text-3xl font-bold">Projetos Inadimplentes</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos</CardTitle>
            <CardDescription>
              Projetos sem domínio configurado ou aguardando pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando projetos...</div>
            ) : !projects?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum projeto inadimplente encontrado
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{project.client_name}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Criado em: {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        {project.domain && (
                          <div>Domínio: {project.domain}</div>
                        )}
                        {project.payment_date && (
                          <div>Data do pagamento: {format(new Date(project.payment_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.hostinger_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.hostinger_link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {project.blaster_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.blaster_link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Editar Projeto: {selectedProject?.client_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="exemplo.com.br"
                />
              </div>
              <div>
                <Label htmlFor="hostinger_link">Link da Hostinger</Label>
                <Input
                  id="hostinger_link"
                  value={formData.hostinger_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, hostinger_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="blaster_link">Link do Blaster</Label>
                <Input
                  id="blaster_link"
                  value={formData.blaster_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, blaster_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="payment_date">Data do Pagamento</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProjectMutation.isPending}
                >
                  {updateProjectMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ProjetosInadimplentes;