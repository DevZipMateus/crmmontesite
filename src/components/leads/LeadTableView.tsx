
import React from "react";
import { Lead } from "@/types/lead";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle, Edit, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadTableViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

const getStatusColor = (situacao: string) => {
  const situacaoLower = situacao.toLowerCase();
  
  if (situacaoLower.includes('pronto') || situacaoLower.includes('finalizado')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  
  if (situacaoLower.includes('aguardando') || situacaoLower.includes('esperando')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  
  if (situacaoLower.includes('cancelou') || situacaoLower.includes('cancelado')) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const getDaysWithoutResponse = (dataContato: string) => {
  const today = new Date();
  const contactDate = new Date(dataContato);
  const diffTime = Math.abs(today.getTime() - contactDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDaysColor = (days: number) => {
  if (days <= 3) return 'text-green-600';
  if (days <= 7) return 'text-yellow-600';
  if (days <= 14) return 'text-orange-600';
  return 'text-red-600';
};

const LeadTableView: React.FC<LeadTableViewProps> = ({ leads, onEdit }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Último Contato</TableHead>
            <TableHead>Dias</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const diasSemResposta = getDaysWithoutResponse(lead.data_ultimo_contato);
            const dataFormatada = formatDistanceToNow(new Date(lead.data_ultimo_contato), {
              addSuffix: true,
              locale: ptBR
            });

            return (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell className="font-medium max-w-[200px]">
                  <div className="truncate">{lead.empresa}</div>
                </TableCell>
                <TableCell>{lead.nome_cliente}</TableCell>
                <TableCell>
                  {lead.vendedor && (
                    <Badge variant="outline" className="text-xs">
                      {lead.vendedor}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.situacao)}>
                    {lead.situacao}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(lead.data_ultimo_contato).toLocaleDateString('pt-BR')}
                  <div className="text-xs text-gray-500">{dataFormatada}</div>
                </TableCell>
                <TableCell>
                  <div className={`flex items-center gap-1 ${getDaysColor(diasSemResposta)}`}>
                    <Clock size={12} />
                    <span className="text-sm font-medium">{diasSemResposta}d</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {lead.link_blaster && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(lead.link_blaster, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    )}
                    
                    {lead.link_chat && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(lead.link_chat, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <MessageCircle size={14} />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(lead)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTableView;
