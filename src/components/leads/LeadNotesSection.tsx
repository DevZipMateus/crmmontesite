
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare } from "lucide-react";
import { useLeadNotes, useCreateLeadNote } from "@/hooks/useLeadNotes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadNotesSectionProps {
  leadId: string;
}

const LeadNotesSection: React.FC<LeadNotesSectionProps> = ({ leadId }) => {
  const [novaNota, setNovaNota] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const { data: notes = [], isLoading } = useLeadNotes(leadId);
  const createNote = useCreateLeadNote();

  const handleAddNote = async () => {
    if (!novaNota.trim()) return;

    try {
      await createNote.mutateAsync({
        leadId,
        nota: novaNota.trim(),
        created_by: 'Usuário'
      });
      setNovaNota("");
      setIsAdding(false);
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare size={20} />
          Anotações e Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botão para adicionar nova anotação */}
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Anotação
          </Button>
        )}

        {/* Formulário para nova anotação */}
        {isAdding && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <Textarea
              placeholder="Digite sua anotação sobre este lead..."
              value={novaNota}
              onChange={(e) => setNovaNota(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddNote}
                disabled={!novaNota.trim() || createNote.isPending}
              >
                {createNote.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNovaNota("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de anotações */}
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">
            Carregando anotações...
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 border rounded-lg bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {note.created_by}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note.nota}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Nenhuma anotação encontrada para este lead.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadNotesSection;
