
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatButtonProps {
  projectId: string;
  projectName: string;
  partnerHash: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  projectId,
  projectName,
  partnerHash
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChat = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Abrindo chat para projeto ${projectName} (${projectId})`);
      
      const { data, error } = await supabase.functions.invoke('send-chat-webhook', {
        body: { projectId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Chat iniciado!",
          description: `Solicitação de chat enviada para ${data.partner_name || 'parceiro'} com sucesso.`,
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao abrir chat:', error);
      toast({
        title: "Erro ao abrir chat",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao enviar solicitação de chat.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenChat}
      disabled={isLoading}
      className="flex items-center gap-1 text-xs px-2 py-1 h-7"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <MessageSquare className="h-3 w-3" />
      )}
      {isLoading ? 'Abrindo...' : 'Chat'}
    </Button>
  );
};
