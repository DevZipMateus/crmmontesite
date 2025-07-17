
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, ExternalLink, Calendar } from "lucide-react";
import { Lead } from "@/types/lead";
import { Project } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectLinkIndicatorProps {
  lead: Lead;
}

export const ProjectLinkIndicator: React.FC<ProjectLinkIndicatorProps> = ({ lead }) => {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', lead.project_id],
    queryFn: async () => {
      if (!lead.project_id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', lead.project_id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar projeto:', error);
        return null;
      }
      
      return data as Project;
    },
    enabled: !!lead.project_id,
  });

  if (!lead.project_id || isLoading) {
    return null;
  }

  if (!project) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-200">
        Projeto não encontrado
      </Badge>
    );
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge 
          variant="outline" 
          className={`cursor-pointer hover:bg-opacity-80 ${getConfidenceColor(lead.link_confidence_score)}`}
        >
          <Briefcase className="h-3 w-3 mr-1" />
          Projeto: {project.client_name}
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Projeto Vinculado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="font-medium">{project.client_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant="outline">{project.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Template</p>
              <p>{project.template || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Responsável</p>
              <p>{project.responsible_name || '—'}</p>
            </div>
          </div>

          {project.domain && (
            <div>
              <p className="text-sm font-medium text-gray-500">Domínio</p>
              <p className="font-mono text-sm">{project.domain}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Data de Criação</p>
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(project.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Vinculação</p>
            <div className="flex justify-between">
              <span className="text-sm">Confiança:</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getConfidenceColor(lead.link_confidence_score)}`}
              >
                {lead.link_confidence_score || 0}%
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
