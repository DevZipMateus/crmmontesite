
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { useModelDetails } from "@/utils/modelUtils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import { useNavigate } from "react-router-dom";
import { useUserPermissions } from "@/hooks/useUserPermissions";

interface ProjectInformationProps {
  project: Project;
}

export const ProjectInformation: React.FC<ProjectInformationProps> = ({ project }) => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserPermissions();
  
  // Use the new hook to get the model name
  const { modelName, isLoading: modelLoading } = useModelDetails(project.template);

  const handleProjectDeleted = () => {
    navigate('/projetos');
  };

  return (
    <div className="space-y-4">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle>Informações do Projeto</CardTitle>
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
