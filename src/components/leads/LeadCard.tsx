import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExternalLink, 
  MessageCircle, 
  Calendar, 
  User,
  Building2,
  Clock,
  Trash,
  AlertTriangle
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
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

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete }) => {
  const diasSemResposta = getDaysWithoutResponse(lead.data_ultimo_contato);
  const dataFormatada = formatDistanceToNow(new Date(lead.data_ultimo_contato), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 break-words min-w-0">
            <Building2 size={18} className="flex-shrink-0" />
            <span className="truncate">{lead.empresa}</span>
          </CardTitle>
          <Badge className={`${getStatusColor(lead.situacao)} text-xs whitespace-nowrap flex-shrink-0`}>
            {lead.situacao}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <User size={14} className="flex-shrink-0" />
            <span className="truncate">{lead.nome_cliente}</span>
          </div>
          {lead.vendedor && (
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span className="truncate">Vendedor: {lead.vendedor}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={14} className={getDaysColor(diasSemResposta)} />
            <span className={getDaysColor(diasSemResposta)}>
              {diasSemResposta} dias sem resposta
            </span>
          </div>
          <span className="text-muted-foreground text-xs sm:text-sm">({dataFormatada})</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="break-words">
              Último contato: {new Date(lead.data_ultimo_contato).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {lead.email && (
          <div className="text-sm text-muted-foreground">
            <strong>E-mail:</strong> {lead.email}
          </div>
        )}

        {lead.cnpj && (
          <div className="text-sm text-muted-foreground">
            <strong>CNPJ/CPF:</strong> {lead.cnpj}
          </div>
        )}

        {lead.observacoes && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded break-words flex-1">
            <strong>Observações:</strong> {lead.observacoes}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 mt-auto">
          <div className="flex flex-wrap gap-2">
            {lead.link_blaster && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(lead.link_blaster, '_blank')}
                className="flex-1 sm:flex-none min-w-0"
              >
                <ExternalLink size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">Blaster</span>
              </Button>
            )}
            
            {lead.link_chat && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(lead.link_chat, '_blank')}
                className="flex-1 sm:flex-none min-w-0"
              >
                <MessageCircle size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">Chat</span>
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(lead)}
              className="flex-1"
            >
              Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash size={14} className="mr-1" />
                  <span className="hidden sm:inline">Excluir</span>
                  <span className="sm:hidden">Del</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá remover o lead "{lead.empresa}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(lead)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;