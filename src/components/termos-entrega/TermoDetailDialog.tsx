import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjectWithTermStatus } from "@/types/deliveryTerm";
import { Star, User, FileText, Calendar, Globe } from "lucide-react";

interface TermoDetailDialogProps {
  project: ProjectWithTermStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermoDetailDialog: React.FC<TermoDetailDialogProps> = ({ project, open, onOpenChange }) => {
  if (!project || !project.delivery_term) return null;

  const term = project.delivery_term;

  const renderStars = (nota: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 font-semibold text-lg">{nota}/10</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Termo de Entrega
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Projeto</h3>
            <p className="font-medium text-lg">{project.client_name}</p>
            {project.domain && (
              <a 
                href={`https://${project.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-1"
              >
                <Globe className="h-3 w-3" />
                {project.domain}
              </a>
            )}
          </div>

          {/* Avaliação */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="h-4 w-4" />
              Nota de Atendimento
            </h3>
            {renderStars(term.nota_atendimento)}
          </div>

          {/* Comentários */}
          {term.comentarios && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Comentários</h3>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{term.comentarios}</p>
            </div>
          )}

          {/* Dados do Cliente */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-1">
              <User className="h-4 w-4" />
              Dados de Identificação
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{term.nome_completo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium">{term.cpf}</p>
              </div>
            </div>
          </div>

          {/* Data de Aceite */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Data do Aceite
            </div>
            <Badge variant="outline">
              {format(new Date(term.data_aceite), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermoDetailDialog;
