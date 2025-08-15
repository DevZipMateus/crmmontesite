import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Edit, ExternalLink, AlertCircle, Trash2, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InadimplentProject {
  id: string;
  client_name: string;
  status: string;
  created_at: string;
  domain?: string;
  hostinger_link?: string;
  blaster_link?: string;
  payment_date?: string;
  is_inadimplente?: boolean;
  remove_from_hostinger?: boolean;
}

const ProjetosInadimplentes = () => {
  const [selectedProject, setSelectedProject] = useState<InadimplentProject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    domain: "",
    hostinger_link: "",
    blaster_link: "",
    payment_date: "",
    remove_from_hostinger: false
  });

  const queryClient = useQueryClient();

  // Query para buscar projetos inadimplentes
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["inadimplent-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_inadimplente", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InadimplentProject[];
    },
  });

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InadimplentProject> }) => {
      const updateData: any = {};
      if (data.domain !== undefined) updateData.domain = data.domain;
      if (data.hostinger_link !== undefined) updateData.hostinger_link = data.hostinger_link;
      if (data.blaster_link !== undefined) updateData.blaster_link = data.blaster_link;
      if (data.payment_date !== undefined) updateData.payment_date = data.payment_date;
      if (data.remove_from_hostinger !== undefined) updateData.remove_from_hostinger = data.remove_from_hostinger;

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Projeto atualizado",
        description: "As informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["inadimplent-projects"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro ao atualizar",
        description: `Não foi possível salvar as alterações: ${error.message}`,
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
      payment_date: project.payment_date || "",
      remove_from_hostinger: project.remove_from_hostinger || false
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedProject) return;

    const updateData = {
      domain: formData.domain.trim() || null,
      hostinger_link: formData.hostinger_link.trim() || null,
      blaster_link: formData.blaster_link.trim() || null,
      payment_date: formData.payment_date || null,
      remove_from_hostinger: formData.remove_from_hostinger
    };

    console.log("Dados para atualização:", updateData);
    console.log("ID do projeto:", selectedProject.id);

    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: updateData
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

  // Calcular quantos projetos precisam ser removidos da Hostinger
  const projectsToRemoveFromHostinger = projects.filter(p => p.remove_from_hostinger);

  return (
    <PageLayout title="Projetos Inadimplentes">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h1 className="text-2xl font-bold">Projetos Inadimplentes ({projects.length} projetos)</h1>
        </div>

        {/* Notificação para remover websites da Hostinger */}
        {projectsToRemoveFromHostinger.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <Trash2 className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800 dark:text-orange-400">
              Ação Requerida: Exclusão de Websites na Hostinger
            </AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              {projectsToRemoveFromHostinger.length === 1 ? (
                <>
                  <strong>1 projeto</strong> está marcado para remoção da hospedagem Hostinger: 
                  <strong> {projectsToRemoveFromHostinger[0].client_name}</strong>
                </>
              ) : (
                <>
                  <strong>{projectsToRemoveFromHostinger.length} projetos</strong> estão marcados para remoção da hospedagem Hostinger: 
                  <strong> {projectsToRemoveFromHostinger.map(p => p.client_name).join(", ")}</strong>
                </>
              )}
              <br />
              Acesse o painel da Hostinger e remova os websites desses clientes inadimplentes.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos</CardTitle>
            <CardDescription>
              Gerencie os 4 projetos marcados como inadimplentes e suas ações de cobrança.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8">Carregando projetos...</p>
            ) : !projects?.length ? (
              <p className="text-center text-muted-foreground py-8">Nenhum projeto inadimplente encontrado.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg relative"
                  >
                    {/* Ícone piscando quando não marcado para remoção da Hostinger */}
                    {!project.remove_from_hostinger && (
                      <div className="absolute top-2 right-2">
                        <Bell className="h-4 w-4 text-orange-500 animate-pulse hover:animate-bounce transition-all duration-300 drop-shadow-lg" />
                      </div>
                    )}
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
                      <div className="flex gap-2 mt-2">
                        {project.blaster_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(project.blaster_link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Blaster
                          </Button>
                        )}
                        {project.remove_from_hostinger && (
                          <Badge variant="destructive" className="text-xs">
                            Removido da Hostinger
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="www.exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="hostinger_link">Link da Hostinger</Label>
                <Input
                  id="hostinger_link"
                  value={formData.hostinger_link}
                  onChange={(e) => setFormData({ ...formData, hostinger_link: e.target.value })}
                  placeholder="https://hostinger.com/..."
                />
              </div>
              <div>
                <Label htmlFor="blaster_link">Link do Blaster</Label>
                <Input
                  id="blaster_link"
                  value={formData.blaster_link}
                  onChange={(e) => setFormData({ ...formData, blaster_link: e.target.value })}
                  placeholder="https://blaster.zipline.com.br/..."
                />
              </div>
              <div>
                <Label htmlFor="payment_date">Data da Inadimplência</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remove_from_hostinger"
                  checked={formData.remove_from_hostinger}
                  onChange={(e) => setFormData({ ...formData, remove_from_hostinger: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="remove_from_hostinger" className="text-sm font-medium text-destructive">
                  Remover website da hospedagem Hostinger
                </Label>
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