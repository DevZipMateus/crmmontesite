
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Award, Copy } from "lucide-react";
import { Project } from "@/types/project";
import { formatDate } from "@/utils/formatters";
import { generateSiteCommand } from "./SiteCommandGenerator";
import { generateEgestorCommand } from "./EGestorCommandGenerator";
import { ClientTypeBadge } from "@/components/projects/ClientTypeBadge";
import { useToast } from "@/hooks/use-toast";

interface ProjectTableProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onGenerateCommand: (text: string) => void;
  selectedProjectId: string | null;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  generatedText: string | null;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ 
  projects, 
  onSelectProject, 
  onGenerateCommand,
  selectedProjectId, 
  isGenerating,
  setIsGenerating,
  generatedText
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
        .then(() => {
          toast({
            title: "Copiado com sucesso!",
            description: "O comando foi copiado para a área de transferência."
          });
        })
        .catch(() => {
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o texto. Tente novamente.",
            variant: "destructive"
          });
        });
    }
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do cliente</TableHead>
            <TableHead>Tipo de cliente</TableHead>
            <TableHead>Modelo escolhido</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data de recebimento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{project.client_name}</TableCell>
              <TableCell>
                <ClientTypeBadge project={project} />
              </TableCell>
              <TableCell>{project.template || "—"}</TableCell>
              <TableCell>{project.responsible_name || "—"}</TableCell>
              <TableCell>{formatDate(project.created_at)}</TableCell>
              <TableCell className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectProject(project.id);
                      generateSiteCommand({ 
                        project, 
                        setIsGenerating, 
                        setGeneratedText: onGenerateCommand 
                      });
                    }}
                    className="flex items-center gap-2 flex-1"
                    disabled={isGenerating}
                  >
                    {isGenerating && selectedProjectId === project.id ? (
                      <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full mr-2" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Gerar Comando
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                    disabled={!generatedText || selectedProjectId !== project.id}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                </div>
                
                {project.client_type?.toLowerCase() === "parceiro" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectProject(project.id);
                      generateEgestorCommand({ 
                        project, 
                        setGeneratedText: onGenerateCommand 
                      });
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
