
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCheck, ExternalLink, Calendar, Phone, Mail } from "lucide-react";
import { Project } from "@/types/project";
import { Lead } from "@/types/lead";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadLinkIndicatorProps {
  project: Project;
}

export const LeadLinkIndicator: React.FC<LeadLinkIndicatorProps> = ({ project }) => {
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', project.lead_id],
    queryFn: async () => {
      if (!project.lead_id) return null;
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', project.lead_id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar lead:', error);
        return null;
      }
      
      return data as Lead;
    },
    enabled: !!project.lead_id,
  });

  if (!project.lead_id || isLoading) {
    return null;
  }

  if (!lead) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-200">
        Lead não encontrado
      </Badge>
    );
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case 'blaster_id': return 'ID Blaster';
      case 'exact_name': return 'Nome Exato';
      case 'client_name': return 'Nome Cliente';
      case 'manual': return 'Manual';
      case 'auto_created': return 'Auto-criado';
      default: return 'Desconhecido';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge 
          variant="outline" 
          className={`cursor-pointer hover:bg-opacity-80 ${getConfidenceColor(lead.link_confidence_score)}`}
        >
          <UserCheck className="h-3 w-3 mr-1" />
          Lead: {lead.empresa}
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Detalhes do Lead Vinculado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Empresa</p>
              <p className="font-medium">{lead.empresa}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="font-medium">{lead.nome_cliente}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Vendedor</p>
              <p>{lead.vendedor || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Situação</p>
              <Badge variant="outline">{lead.situacao}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Último Contato</p>
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(lead.data_ultimo_contato).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {lead.link_chat && (
            <div>
              <p className="text-sm font-medium text-gray-500">Chat</p>
              <a 
                href={lead.link_chat} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Chat
              </a>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Vinculação</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Método:</span>
                <Badge variant="outline" className="text-xs">
                  {getMethodLabel(lead.link_method)}
                </Badge>
              </div>
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

          {lead.observacoes && (
            <div>
              <p className="text-sm font-medium text-gray-500">Observações</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{lead.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
