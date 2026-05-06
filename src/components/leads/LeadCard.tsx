import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock,
  Pencil,
  MoreVertical,
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { LeadFormUrlGenerator } from "./LeadFormUrlGenerator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const getStatusDotColor = (situacao: string) => {
  const s = situacao.toLowerCase();
  if (s.includes('pronto') || s.includes('finalizado') || s.includes('fechado')) return 'bg-emerald-500';
  if (s.includes('negociando')) return 'bg-amber-500';
  if (s.includes('novo') || s.includes('recebido')) return 'bg-blue-500';
  if (s.includes('contato')) return 'bg-blue-500';
  if (s.includes('cancelou') || s.includes('cancelado') || s.includes('perdido')) return 'bg-red-500';
  return 'bg-gray-400';
};

const getBorderColor = (lead: Lead) => {
  const s = lead.situacao.toLowerCase();
  const dias = getDaysWithoutResponse(lead.data_ultimo_contato);
  if (s.includes('sem retorno') || dias > 7) return 'border-l-amber-500';
  if (s.includes('cancelou') || s.includes('cancelado')) return 'border-l-red-400';
  return 'border-l-transparent';
};

const getDaysWithoutResponse = (dataContato: string) => {
  const diffTime = Math.abs(Date.now() - new Date(dataContato).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

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
  const isAtrasado = diasSemResposta > 7 && !lead.situacao.toLowerCase().includes('site pronto');

  return (
    <Card className={`border-l-4 ${getBorderColor(lead)} hover:shadow-md transition-all`}>
      <CardContent className="p-4 space-y-3">
        {/* Row 1: Avatar + Name + Status + Edit */}
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarColor(lead.empresa)}`}>
            {getInitials(lead.empresa)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{lead.empresa}</h3>
              <span className="flex items-center gap-1 flex-shrink-0">
                <span className={`h-2 w-2 rounded-full ${getStatusDotColor(lead.situacao)}`} />
                <span className="text-xs text-muted-foreground">{lead.situacao}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {lead.nome_cliente}
              {lead.email && <> · {lead.email}</>}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => onEdit(lead)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Row 2: Vendedor + Time + Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {lead.vendedor && (
            <div className="flex items-center gap-1.5">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${getAvatarColor(lead.vendedor)}`}>
                {getInitials(lead.vendedor)}
              </div>
              <span className="text-xs text-muted-foreground">{lead.vendedor}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Último contato {dataFormatada}</span>
          </div>
          {isAtrasado && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertTriangle className="h-3 w-3" />
              {diasSemResposta} dias sem resposta
            </span>
          )}
        </div>

        {/* Row 3: Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {lead.form_hash && lead.project_id && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 bg-blue-50 text-blue-700 border-blue-200 font-normal">
              Form preenchido
            </Badge>
          )}
          {lead.form_hash && !lead.project_id && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 bg-orange-50 text-orange-700 border-orange-200 font-normal">
              Form pendente
            </Badge>
          )}
          {lead.situacao.toLowerCase().includes('site pronto') && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-normal">
              Site pronto
            </Badge>
          )}
          {isAtrasado && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 bg-amber-50 text-amber-700 border-amber-200 font-normal">
              Sem retorno · {diasSemResposta}d
            </Badge>
          )}
        </div>

        {/* Row 4: Actions row */}
        <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/50">
          <LeadFormUrlGenerator lead={lead} compact />
          {lead.link_chat && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600" onClick={() => window.open(lead.link_chat, '_blank')}>
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lead)}>Editar</DropdownMenuItem>
              {lead.link_blaster && (
                <DropdownMenuItem onClick={() => window.open(lead.link_blaster, '_blank')}>
                  Abrir Blaster
                </DropdownMenuItem>
              )}
              {lead.link_chat && (
                <DropdownMenuItem onClick={() => window.open(lead.link_chat, '_blank')}>
                  Abrir Chat
                </DropdownMenuItem>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    Excluir
                  </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
