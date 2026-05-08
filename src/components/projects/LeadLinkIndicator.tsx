
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCheck, ExternalLink, Calendar, Phone, Mail, MessageSquare, Clock } from "lucide-react";
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

  const getDaysSinceLastContact = () => {
    const lastContact = new Date(lead.data_ultimo_contato);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSituationColor = (situacao: string) => {
    switch (situacao.toLowerCase()) {
      case 'em contato':
      case 'aguardando resposta':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preenchendo formulário':
      case 'em desenvolvimento':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'site pronto':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'sem resposta':
      case 'cancelado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const daysSinceContact = getDaysSinceLastContact();

  return (
    <div className="space-y-2">
      {/* Badge principal com link para dialog */}
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
                <p className="text-sm font-medium text-gray-500 mb-2">Chat</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(lead.link_chat, '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Abrir Chat
                </Button>
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

      {/* Informações rápidas do lead */}
      <div className="flex flex-wrap gap-1">
        {/* Dias desde último contato */}
        <Badge variant="outline" className={`text-xs ${daysSinceContact > 7 ? 'bg-red-100 text-red-700 border-red-200' : daysSinceContact > 3 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
          <Clock className="h-3 w-3 mr-1" />
          {daysSinceContact} dia{daysSinceContact !== 1 ? 's' : ''}
        </Badge>

        {/* Link do chat se disponível */}
        {lead.link_chat && (
          <a 
            href={lead.link_chat} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 cursor-pointer">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </Badge>
          </a>
        )}
      </div>
    </div>
  );
};
