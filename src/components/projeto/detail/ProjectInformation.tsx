
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { useModelDetails } from "@/utils/modelUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import { useNavigate } from "react-router-dom";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { formatCnpjCpf } from "@/utils/documentFormatter";
import { updateProject } from "@/server/project-actions";
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

interface ProjectInformationProps {
  project: Project;
}

export const ProjectInformation: React.FC<ProjectInformationProps> = ({ project }) => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserPermissions();
  const { toast } = useToast();
  const [isUpdatingInadimplente, setIsUpdatingInadimplente] = useState(false);
  
  // Use the new hook to get the model name
  const { modelName, isLoading: modelLoading } = useModelDetails(project.template);

  const handleProjectDeleted = () => {
    navigate('/projetos');
  };

  const handleToggleInadimplente = async () => {
    setIsUpdatingInadimplente(true);
    try {
      const newStatus = !project.is_inadimplente;
      
      // Preparar dados para atualização
      const updateData: any = {
        is_inadimplente: newStatus
      };
      
      // Se está marcando como inadimplente, definir a data atual como payment_date
      if (newStatus) {
        updateData.payment_date = new Date().toISOString();
      }
      
      const result = await updateProject(project.id, updateData);

      if (result.success) {
        toast({
          title: newStatus ? "Projeto marcado como inadimplente" : "Projeto removido dos inadimplentes",
          description: `O projeto foi ${newStatus ? 'adicionado à' : 'removido da'} lista de inadimplentes.`,
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error(result.message || "Erro ao atualizar status de inadimplência");
      }
    } catch (error) {
      console.error("Erro ao atualizar inadimplência:", error);
      toast({
        title: "Erro ao atualizar inadimplência",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingInadimplente(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle>Informações do Projeto</CardTitle>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={project.is_inadimplente ? "destructive" : "outline"}
                    size="sm"
                    disabled={isUpdatingInadimplente}
                    className={project.is_inadimplente ? "" : "border-orange-500 text-orange-600 hover:bg-orange-50"}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {project.is_inadimplente ? "Remover Inadimplência" : "Marcar como Inadimplente"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {project.is_inadimplente ? "Remover Inadimplência" : "Confirmar Inadimplência"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {project.is_inadimplente 
                        ? `Tem certeza que deseja remover o projeto "${project.client_name}" da lista de inadimplentes?`
                        : `Tem certeza que deseja marcar o projeto "${project.client_name}" como inadimplente? Esta ação pode afetar os serviços do cliente.`
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleToggleInadimplente}
                      className={project.is_inadimplente ? "" : "bg-orange-600 hover:bg-orange-700"}
                    >
                      {project.is_inadimplente ? "Remover" : "Marcar como Inadimplente"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {!isLoading && isAdmin && (
                <DeleteProjectDialog 
                  projectId={project.id}
                  projectName={project.client_name}
                  onDelete={handleProjectDeleted}
                  variant="button"
                  size="sm"
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="mt-1">{project.client_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1">{project.status || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Template</p>
              <p className="mt-1">
                {modelLoading ? (
                  <span className="text-gray-400">Carregando...</span>
                ) : (
                  modelName
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Responsável</p>
              <p className="mt-1">{project.responsible_name || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Domínio</p>
              <p className="mt-1">{project.domain || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p className="mt-1">{project.telefone || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CNPJ/CPF</p>
              <p className="mt-1">
                {project.cnpj ? formatCnpjCpf(project.cnpj) : '—'}
              </p>
            </div>
            
            {/* Seção específica para projetos de parceiros */}
            {project.partner_hash && (
              <>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Status do Formulário</p>
                  <div className="mt-1">
                    {project.formulario_preenchido ? (
                      <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Formulário preenchido
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Aguardando preenchimento
                      </Badge>
                    )}
                  </div>
                </div>
                
                {project.data_formulario && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data do Formulário</p>
                    <p className="mt-1">
                      {new Date(project.data_formulario).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                
                {project.email_complementar && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Complementar</p>
                    <p className="mt-1">{project.email_complementar}</p>
                  </div>
                )}
                
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Link do Formulário</p>
                  <p className="mt-1">
                    <a 
                      href={`https://montesite.com.br/${project.partner_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline break-all"
                    >
                      https://montesite.com.br/{project.partner_hash}
                    </a>
                  </p>
                </div>
              </>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-500">Data de Criação</p>
              <p className="mt-1">
                {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Última Atualização</p>
              <p className="mt-1">
                {project.updated_at ? new Date(project.updated_at).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo de Cliente</p>
              <p className="mt-1">{project.client_type || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Link do Blaster</p>
              <p className="mt-1">
                {project.blaster_link ? (
                  <a 
                    href={project.blaster_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline break-all"
                  >
                    {project.blaster_link}
                  </a>
                ) : '—'}
              </p>
            </div>
            {project.client_type === 'parceiro' && project.partner_link && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Link do Parceiro</p>
                <p className="mt-1">
                  <a 
                    href={project.partner_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline break-all"
                  >
                    {project.partner_link}
                  </a>
                </p>
              </div>
            )}
            {project.personalization_id && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">ID de Personalização</p>
                <p className="mt-1">{project.personalization_id}</p>
              </div>
            )}
            {project.provider_credentials && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Credenciais do Provedor</p>
                <p className="mt-1">{project.provider_credentials}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
