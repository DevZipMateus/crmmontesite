
import { supabase } from "@/integrations/supabase/client";

export class ChatWebhookService {
  static async sendChatRequest(projectId: string): Promise<{
    success: boolean;
    message?: string;
    partnerName?: string;
    error?: string;
  }> {
    try {
      console.log(`Enviando solicitação de chat para projeto ${projectId}`);
      
      const { data, error } = await supabase.functions.invoke('send-chat-webhook', {
        body: { projectId }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('Webhook de chat enviado com sucesso:', data);
        return {
          success: true,
          message: data.message,
          partnerName: data.partner_name
        };
      } else {
        console.error('Falha no webhook:', data);
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao enviar webhook de chat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Método para obter logs de chat webhooks de um projeto
  static async getChatWebhookLogs(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('project_id', projectId)
        .eq('webhook_type', 'sent')
        .like('payload->type', 'open_chat')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de chat:', error);
      return [];
    }
  }
}
