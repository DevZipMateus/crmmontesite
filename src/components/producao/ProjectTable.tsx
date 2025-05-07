
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Award } from "lucide-react";
import { Project } from "@/types/project";
import { formatDate } from "@/utils/formatters";
import { generateCommand, generateEgestorCommand } from "./CommandGenerator";

interface ProjectTableProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onGenerateCommand: (text: string) => void;
  selectedProjectId: string | null;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ 
  projects, 
  onSelectProject, 
  onGenerateCommand,
  selectedProjectId, 
  isGenerating,
  setIsGenerating
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do cliente</TableHead>
            <TableHead>Modelo escolhido</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Tipo de cliente</TableHead>
            <TableHead>Data de recebimento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{project.client_name}</TableCell>
              <TableCell>{project.template || "—"}</TableCell>
              <TableCell>{project.responsible_name || "—"}</TableCell>
              <TableCell>{project.client_type || "—"}</TableCell>
              <TableCell>{formatDate(project.created_at)}</TableCell>
              <TableCell className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectProject(project.id);
                    generateCommand({ 
                      project, 
                      setIsGenerating, 
                      setGeneratedText: onGenerateCommand 
                    });
                  }}
                  className="flex items-center gap-2 w-full"
                  disabled={isGenerating}
                >
                  {isGenerating && selectedProjectId === project.id ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full mr-2" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Gerar Comando
                </Button>
                
                {project.client_type?.toLowerCase() === "parceiro" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectProject(project.id);
                      generateEgestorCommand(project, onGenerateCommand);
                    }}
                    className="flex items-center gap-2 w-full mt-2"
                  >
                    <Award className="h-4 w-4" />
                    Gerar Anúncio eGestor
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
