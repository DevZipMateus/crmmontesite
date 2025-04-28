
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { deleteProject } from "@/server/project-actions";
import { useToast } from "@/hooks/use-toast";

interface DeleteProjectDialogProps {
  projectId: string;
  projectName: string;
  onDelete?: () => void;
  variant?: "icon" | "button";
  size?: "sm" | "default";
}

export default function DeleteProjectDialog({
  projectId,
  projectName,
  onDelete,
  variant = "icon",
  size = "sm",
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { success } = await deleteProject(projectId);
      
      if (success) {
        toast({
          title: "Projeto excluído",
          description: `O projeto "${projectName}" foi excluído com sucesso.`,
        });
        if (onDelete) {
          onDelete();
        }
      }
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          variant="outline"
          size={size}
          onClick={() => setOpen(true)}
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
          title="Excluir projeto"
        >
          <Trash className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
        </Button>
      ) : (
        <Button
          variant="destructive"
          size={size}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
          Excluir
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "{projectName}"?
              <br />
              <br />
              <strong className="text-red-600">
                Esta ação não pode ser desfeita e excluirá todas as customizações associadas.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir projeto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
