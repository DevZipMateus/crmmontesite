
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
        <div className="grid grid-cols-2 gap-4">
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
          {project.client_type && (
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo de Cliente</p>
              <p className="mt-1">{project.client_type}</p>
            </div>
          )}
          {project.partner_link && (
            <div>
              <p className="text-sm font-medium text-gray-500">Link do Parceiro</p>
              <p className="mt-1">
                <a href={project.partner_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {project.partner_link}
                </a>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
