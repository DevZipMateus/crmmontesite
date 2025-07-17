
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isArchiving: boolean;
  projectName: string;
  isArchived: boolean;
}

export const ArchiveDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isArchiving,
  projectName,
  isArchived
}: ArchiveDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? "Desarquivar projeto" : "Arquivar projeto"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived ? (
              <>
                Tem certeza que deseja <strong>desarquivar</strong> o projeto "{projectName}"?
                <br />
                O projeto voltará a aparecer na listagem normal.
              </>
            ) : (
              <>
                Tem certeza que deseja <strong>arquivar</strong> o projeto "{projectName}"?
                <br />
                O projeto ficará oculto da listagem normal, mas ainda poderá ser encontrado através da busca.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isArchiving}
            className={isArchived ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isArchiving ? "Processando..." : (isArchived ? "Desarquivar" : "Arquivar")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
