
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={18} />
            {lead.empresa}
          </CardTitle>
          <Badge className={getStatusColor(lead.situacao)}>
            {lead.situacao}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} />
          {lead.nome_cliente}
          {lead.vendedor && (
            <>
              <span>•</span>
              <span>Vendedor: {lead.vendedor}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className={getDaysColor(diasSemResposta)} />
          <span className={getDaysColor(diasSemResposta)}>
            {diasSemResposta} dias sem resposta
          </span>
          <span className="text-gray-500">({dataFormatada})</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          Último contato: {new Date(lead.data_ultimo_contato).toLocaleDateString('pt-BR')}
        </div>

        {lead.observacoes && (
          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
            {lead.observacoes}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {lead.link_blaster && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(lead.link_blaster, '_blank')}
            >
              <ExternalLink size={14} className="mr-1" />
              Blaster
            </Button>
          )}
          
          {lead.link_chat && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(lead.link_chat, '_blank')}
            >
              <MessageCircle size={14} className="mr-1" />
              Chat
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(lead)}
            className="ml-auto"
          >
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash size={14} className="mr-1" />
                Excluir
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
      </CardContent>
    </Card>
  );
};

export default LeadCard;
