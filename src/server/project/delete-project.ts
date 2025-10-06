
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";

// Function to delete a project and its related data
export async function deleteProject(id: string) {
  try {
    // Invoca a Edge Function com privilégios de service role para contornar RLS
    const { data, error } = await supabase.functions.invoke('delete-project', {
      body: { id }
    });

    if (error || !data?.success) {
      const message = error?.message || data?.error || 'Falha ao excluir projeto';
      console.error('Erro na edge function delete-project:', message);
      toast({
        title: 'Erro ao excluir projeto',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: new Error(message) };
    }

    toast({
      title: 'Projeto excluído com sucesso',
      description: 'O projeto e seus registros relacionados foram removidos.',
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    toast({
      title: 'Erro ao excluir projeto',
      description: error instanceof Error ? error.message : 'Erro desconhecido',
      variant: 'destructive',
    });
    return { success: false, error };
  }
}
