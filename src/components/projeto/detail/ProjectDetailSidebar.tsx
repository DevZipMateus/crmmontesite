import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { Terminal, Copy, AlertTriangle, Clock } from "lucide-react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import { updateProject } from "@/server/project-actions";
import { generateSiteCommand } from "@/components/producao/SiteCommandGenerator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectDetailSidebarProps {
  project: Project;
}

export const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = ({ project }) => {
  const { toast } = useToast();
  const [isUpdatingInadimplente, setIsUpdatingInadimplente] = useState(false);
  const [isGeneratingCommand, setIsGeneratingCommand] = useState(false);

  const canGenerateCommand = project.status === 'Recebido' || project.status === 'Victor' || project.status === 'Davi';

  const handleGenerateCommand = useCallback(async () => {
    if (!canGenerateCommand) return;
    setIsGeneratingCommand(true);
    let commandText = '';
    await generateSiteCommand({
      project,
      setIsGenerating: setIsGeneratingCommand,
      setGeneratedText: (text) => { commandText = text; },
    });
    if (commandText) {
      await navigator.clipboard.writeText(commandText);
      toast({ title: "Comando copiado!", description: "Comando completo copiado para a área de transferência." });
    }
    setIsGeneratingCommand(false);
  }, [project, canGenerateCommand, toast]);

  const responsible = project.responsible_name || project.assigned_programmer || "Nao atribuido";
  const initials = responsible.substring(0, 2).toUpperCase();

  const handleCopyPublicLink = () => {
    if (project.client_submission_hash) {
      const link = `${window.location.origin}/envio/${project.client_submission_hash}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Link copiado!", description: "Link publico copiado para a area de transferencia." });
    }
  };

  const handleToggleInadimplente = async () => {
    setIsUpdatingInadimplente(true);
    try {
      const newStatus = !project.is_inadimplente;
      const updateData: Record<string, unknown> = { is_inadimplente: newStatus };
      if (newStatus) updateData.payment_date = new Date().toISOString();

      const result = await updateProject(project.id, updateData);
      if (result.success) {
        toast({
          title: newStatus ? "Marcado como inadimplente" : "Removido dos inadimplentes",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setIsUpdatingInadimplente(false);
    }
  };

  // Build timeline events
  const timelineEvents = [
    ...(project.status === 'Site pronto' || project.status === 'Victor' || project.status === 'Davi'
      ? [{ label: project.status === 'Site pronto' ? 'Site pronto' : 'Em producao', date: project.updated_at, color: 'bg-amber-400', by: responsible }]
      : []),
    ...(project.personalization_id
      ? [{ label: 'Personalizacao recebida', date: project.data_formulario || project.updated_at, color: 'bg-blue-500', by: 'Sistema' }]
      : []),
    ...(project.lead_id
      ? [{ label: 'Lead vinculado', date: project.created_at, color: 'bg-blue-500', by: 'Auto-linking' }]
      : []),
    { label: 'Projeto criado', date: project.created_at, color: 'bg-muted-foreground', by: responsible },
  ];

  return (
    <div className="space-y-4">
      {/* Status & Responsible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Status & Responsavel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{responsible}</p>
                <p className="text-xs text-muted-foreground">Responsavel atual</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-3 space-y-1.5">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-xs"
            size="sm"
            disabled={!canGenerateCommand || isGeneratingCommand}
            onClick={handleGenerateCommand}
            title={!canGenerateCommand ? "Disponível apenas para projetos com status 'Recebido', 'Victor' ou 'Davi'" : "Gerar e copiar comando"}
          >
            <Terminal className="h-3.5 w-3.5" />
            {isGeneratingCommand ? 'Gerando...' : 'Gerar comando'}
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" size="sm" onClick={handleCopyPublicLink}>
            <Copy className="h-3.5 w-3.5" />
            Copiar link publico
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs" 
                size="sm"
                disabled={isUpdatingInadimplente}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {project.is_inadimplente ? "Remover inadimplencia" : "Marcar como inadimplente"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {project.is_inadimplente ? "Remover Inadimplencia" : "Confirmar Inadimplencia"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {project.is_inadimplente 
                    ? `Remover "${project.client_name}" da lista de inadimplentes?`
                    : `Marcar "${project.client_name}" como inadimplente?`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleInadimplente}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Linha do tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 pl-4">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            
            {timelineEvents.map((event, i) => (
              <div key={i} className="relative flex gap-3">
                <div className={`h-3.5 w-3.5 rounded-full ${event.color} shrink-0 mt-0.5 ring-2 ring-card z-10 -ml-4`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date ? new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} · {event.by}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Zona de perigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteProjectDialog
            projectId={project.id}
            projectName={project.client_name}
            onDelete={() => window.location.href = '/projetos'}
            variant="button"
            size="sm"
          />
        </CardContent>
      </Card>
    </div>
  );
};
