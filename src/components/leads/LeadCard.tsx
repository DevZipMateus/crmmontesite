import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ExternalLink, 
  MessageCircle, 
  User,
  Clock,
  Trash,
  Pencil
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LeadFormUrlGenerator } from "./LeadFormUrlGenerator";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const getStatusStyle = (situacao: string) => {
  const s = situacao.toLowerCase();
  if (s.includes('pronto') || s.includes('finalizado')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s.includes('aguardando') || s.includes('esperando')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s.includes('cancelou') || s.includes('cancelado')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('negociando')) return 'bg-violet-100 text-violet-700 border-violet-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
};

const getBorderColor = (situacao: string) => {
  const s = situacao.toLowerCase();
  if (s.includes('pronto') || s.includes('finalizado')) return 'border-l-emerald-500';
  if (s.includes('aguardando') || s.includes('esperando') || s.includes('sem retorno')) return 'border-l-amber-500';
  if (s.includes('cancelou') || s.includes('cancelado')) return 'border-l-red-500';
  return 'border-l-primary';
};

const getDaysWithoutResponse = (dataContato: string) => {
  const diffTime = Math.abs(Date.now() - new Date(dataContato).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysColor = (days: number) => {
  if (days <= 3) return 'text-emerald-600';
  if (days <= 7) return 'text-amber-600';
  return 'text-red-600';
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete }) => {
  const diasSemResposta = getDaysWithoutResponse(lead.data_ultimo_contato);
  const dataFormatada = formatDistanceToNow(new Date(lead.data_ultimo_contato), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={`border-l-4 ${getBorderColor(lead.situacao)} hover:shadow-md transition-all h-full flex flex-col`}>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(lead.empresa)}`}>
            {getInitials(lead.empresa)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{lead.empresa}</h3>
              <Badge className={`${getStatusStyle(lead.situacao)} text-[10px] px-1.5 py-0 flex-shrink-0`}>
                {lead.situacao}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" />
              <span className="truncate">{lead.nome_cliente}</span>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className={`h-3 w-3 ${getDaysColor(diasSemResposta)}`} />
            <span className={getDaysColor(diasSemResposta)}>
              {diasSemResposta}d sem resposta
            </span>
          </div>
          <span className="text-muted-foreground">{dataFormatada}</span>
        </div>

        {/* Vendedor + email */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {lead.vendedor && (
            <div className="flex items-center gap-1.5">
              <div className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${getAvatarColor(lead.vendedor)}`}>
                {getInitials(lead.vendedor)}
              </div>
              <span className="truncate">{lead.vendedor}</span>
            </div>
          )}
          {lead.email && <p className="truncate">{lead.email}</p>}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {lead.form_hash && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
              Form preenchido
            </Badge>
          )}
          {lead.project_id && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
              Projeto vinculado
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
          <LeadFormUrlGenerator lead={lead} compact />
          <div className="flex-1" />
          {lead.link_blaster && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(lead.link_blaster, '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          {lead.link_chat && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(lead.link_chat, '_blank')}>
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(lead)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Trash className="h-3.5 w-3.5" />
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
