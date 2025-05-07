
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";

interface ProjectInformationProps {
  project: Project;
}

export const ProjectInformation: React.FC<ProjectInformationProps> = ({ project }) => {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle>Informações do Projeto</CardTitle>
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
            <p className="mt-1">{project.template || '—'}</p>
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
          {/* Removed partner_link section since it doesn't exist in the Project type */}
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
  );
};
