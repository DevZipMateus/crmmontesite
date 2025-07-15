
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Plus
} from "lucide-react";
import { useLeadAgendamentos, useUpdateAgendamento, useExtendAgendamento } from "@/hooks/useLeadAgendamentos";
import { LeadAgendamento } from "@/types/agendamento";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SchedulingListProps {
  leadId: string;
}

const QuickTimeButtons: React.FC<{ agendamento: LeadAgendamento }> = ({ agendamento }) => {
  const extendAgendamento = useExtendAgendamento();

  const timeOptions = [
    { label: "+15min", minutes: 15 },
    { label: "+30min", minutes: 30 },
    { label: "+1h", minutes: 60 },
    { label: "+2h", minutes: 120 }
  ];

  const handleExtendTime = (minutes: number) => {
    extendAgendamento.mutate({
      agendamentoId: agendamento.id,
      minutesToAdd: minutes
    });
  };

  if (agendamento.status === 'Concluído' || agendamento.status === 'Cancelado') {
    return null;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {timeOptions.map((option) => (
        <Button
          key={option.label}
          variant="outline"
          size="sm"
          onClick={() => handleExtendTime(option.minutes)}
          disabled={extendAgendamento.isPending}
          className="text-xs h-7"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

const AgendamentoCard: React.FC<{ agendamento: LeadAgendamento }> = ({ agendamento }) => {
  const updateAgendamento = useUpdateAgendamento();

  const handleStatusChange = (newStatus: LeadAgendamento['status']) => {
    const updates: Partial<LeadAgendamento> = { status: newStatus };
    
    if (newStatus === 'Concluído') {
      updates.completed_at = new Date().toISOString();
    }

    updateAgendamento.mutate({
      id: agendamento.id,
      updates
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      case 'Reagendado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(agendamento.data_agendamento) < new Date() && agendamento.status === 'Pendente';

  return (
    <Card className={`mb-3 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{agendamento.titulo}</h4>
            {agendamento.descricao && (
              <p className="text-sm text-gray-600 mb-2">{agendamento.descricao}</p>
            )}
          </div>
          <Badge className={getStatusColor(agendamento.status)}>
            {agendamento.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {format(new Date(agendamento.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {format(new Date(agendamento.data_agendamento), "HH:mm", { locale: ptBR })}
          </div>
          {agendamento.postponed_count && agendamento.postponed_count > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <RotateCcw size={14} />
              Reagendado {agendamento.postponed_count}x
            </div>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Atrasado
            </Badge>
          )}
        </div>

        {agendamento.original_time && agendamento.original_time !== agendamento.data_agendamento && (
          <div className="text-xs text-gray-500 mb-3">
            Horário original: {format(new Date(agendamento.original_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
        )}

        {/* Botões de extensão de tempo */}
        {agendamento.status === 'Pendente' && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">Estender horário:</div>
            <QuickTimeButtons agendamento={agendamento} />
          </div>
        )}

        {/* Ações de status */}
        <div className="flex gap-2">
          {agendamento.status === 'Pendente' && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange('Concluído')}
                disabled={updateAgendamento.isPending}
                className="text-xs"
              >
                <CheckCircle size={14} className="mr-1" />
                Concluído
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('Cancelado')}
                disabled={updateAgendamento.isPending}
                className="text-xs"
              >
                <XCircle size={14} className="mr-1" />
                Cancelar
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Criado em {format(new Date(agendamento.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          {agendamento.completed_at && (
            <span> • Concluído em {format(new Date(agendamento.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SchedulingList: React.FC<SchedulingListProps> = ({ leadId }) => {
  const { data: agendamentos = [], isLoading } = useLeadAgendamentos(leadId);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-4">
        Carregando agendamentos...
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Calendar className="mx-auto mb-2 text-gray-400" size={24} />
        Nenhum agendamento encontrado para este lead.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agendamentos.map((agendamento) => (
        <AgendamentoCard key={agendamento.id} agendamento={agendamento} />
      ))}
    </div>
  );
};

export default SchedulingList;
