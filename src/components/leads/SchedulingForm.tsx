
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { useCreateAgendamento } from "@/hooks/useLeadAgendamentos";

interface SchedulingFormProps {
  leadId: string;
  onCancel: () => void;
}

const SchedulingForm: React.FC<SchedulingFormProps> = ({ leadId, onCancel }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const createAgendamento = useCreateAgendamento();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !data || !hora) {
      return;
    }

    // Combinar data e hora em formato ISO
    const dataAgendamento = new Date(`${data}T${hora}`);
    
    try {
      await createAgendamento.mutateAsync({
        lead_id: leadId,
        titulo,
        descricao,
        data_agendamento: dataAgendamento.toISOString()
      });
      
      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setData("");
      setHora("");
      onCancel();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  // Definir data mínima como hoje
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título do Agendamento *</Label>
        <Input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Ligação para apresentação de proposta"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhes adicionais sobre o contato..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={today}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hora">Horário *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={!titulo || !data || !hora || createAgendamento.isPending}
          className="flex-1"
        >
          {createAgendamento.isPending ? 'Agendando...' : 'Agendar Contato'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createAgendamento.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default SchedulingForm;
