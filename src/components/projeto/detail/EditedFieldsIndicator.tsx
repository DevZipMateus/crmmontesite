import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit3, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditedFieldsIndicatorProps {
  editedFields: string[] | null;
  lastEditedAt: string | null;
  editCount: number;
}

export const EditedFieldsIndicator: React.FC<EditedFieldsIndicatorProps> = ({
  editedFields,
  lastEditedAt,
  editCount,
}) => {
  if (!editedFields || editedFields.length === 0) {
    return null;
  }

  const formattedDate = lastEditedAt
    ? format(new Date(lastEditedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Formulário reenviado</span>
        {editCount > 1 && (
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
            {editCount}x editado
          </Badge>
        )}
      </div>

      {formattedDate && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
          <Clock className="h-4 w-4" />
          <span>Última edição: {formattedDate}</span>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Campos modificados:
        </p>
        <div className="flex flex-wrap gap-2">
          {editedFields.map((field, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800 cursor-default"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    {field}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Este campo foi modificado no último reenvio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};
