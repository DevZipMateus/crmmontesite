import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileEdit, Trash2 } from 'lucide-react';

interface DraftRecoveryDialogProps {
  open: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  savedTimestamp?: string;
}

export const DraftRecoveryDialog: React.FC<DraftRecoveryDialogProps> = ({
  open,
  onRestore,
  onDiscard,
  savedTimestamp
}) => {
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            Rascunho Encontrado
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Encontramos um rascunho salvo deste formulário.
            </p>
            {savedTimestamp && (
              <p className="text-sm font-medium text-foreground">
                Salvo em: {formatDate(savedTimestamp)}
              </p>
            )}
            <p className="pt-2">
              Deseja continuar de onde parou ou começar um novo formulário?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Começar Novo
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRestore} className="gap-2">
            <FileEdit className="h-4 w-4" />
            Continuar Preenchendo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
