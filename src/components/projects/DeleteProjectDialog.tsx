
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
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/server/project-actions";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Check for project dependencies when dialog opens
  const { data: dependencies, isLoading } = useQuery({
    queryKey: ["project-dependencies", projectId],
    queryFn: async () => {
      const [leadsResult, webhooksResult] = await Promise.all([
        supabase
          .from('leads')
          .select('id, empresa')
          .eq('project_id', projectId),
        supabase
          .from('webhook_logs')
          .select('id')
          .eq('project_id', projectId)
      ]);

      return {
        leads: leadsResult.data || [],
        webhooks: webhooksResult.data || [],
        hasErrors: leadsResult.error || webhooksResult.error
      };
    },
    enabled: open,
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProject(projectId);
      
      if (result.success) {
        if (onDelete) {
          onDelete();
        }
      }
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      toast({
        title: "Erro ao excluir projeto",
        description: "Ocorreu um erro ao tentar excluir o projeto.",
        variant: "destructive",
      });
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
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Excluir projeto"
        >
          <Trash2 className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
        </Button>
      ) : (
        <Button
          variant="destructive"
          size={size}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
          Excluir
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Tem certeza que deseja excluir o projeto "{projectName}"?
                </p>
                
                {isLoading && (
                  <p className="text-sm text-muted-foreground">
                    Verificando dependências...
                  </p>
                )}
                
                {dependencies && !isLoading && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      O que será feito:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {dependencies.leads.length > 0 && (
                        <li>• {dependencies.leads.length} lead(s) serão desvinculados</li>
                      )}
                      {dependencies.webhooks.length > 0 && (
                        <li>• {dependencies.webhooks.length} log(s) de webhook serão excluídos</li>
                      )}
                      <li>• Todas as customizações serão excluídas</li>
                      <li>• O projeto será permanentemente removido</li>
                    </ul>
                  </div>
                )}
                
                <p className="text-sm font-medium text-red-600">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting || isLoading}
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
