
import { supabase } from "@/integrations/supabase/client";

export class EGestorProjectService {
  private static readonly EGESTOR_CONFIG = {
    name: "eGestor - Painel Parceiros",
    hash: "egestor_painel_parceiros",
    webhook_url: "https://v4.egestor.com.br/parceiros2/webhook_receiver.php",
    auth_token: "whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12"
  };

  // Identificar se um hash pertence ao eGestor baseado no padrão
  static isEGestorHash(hash: string): boolean {
    if (!hash) return false;
    
    // Hash padrão do eGestor
    if (hash === this.EGESTOR_CONFIG.hash) return true;
    
    // Padrão de hashes individuais do eGestor (32 caracteres hexadecimais)
    const egestorHashPattern = /^[a-f0-9]{32}$/i;
    return egestorHashPattern.test(hash);
  }

  // Obter configurações do webhook para um hash do eGestor
  static getEGestorWebhookConfig() {
    return {
      webhook_url: this.EGESTOR_CONFIG.webhook_url,
      auth_token: this.EGESTOR_CONFIG.auth_token,
      partner_name: this.EGESTOR_CONFIG.name
    };
  }

  // Marcar um projeto como sendo do eGestor
  static async markProjectAsEGestor(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          partner_webhook_url: this.EGESTOR_CONFIG.webhook_url,
          project_source: 'parceiro'
        })
        .eq('id', projectId);

      if (error) {
        console.error('Erro ao marcar projeto como eGestor:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao marcar projeto:', error);
      return false;
    }
  }

  // Verificar e atualizar projetos existentes do eGestor
  static async updateExistingEGestorProjects(): Promise<number> {
    try {
      // Buscar projetos com hashes que parecem ser do eGestor mas sem webhook_url
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, partner_hash')
        .is('partner_webhook_url', null)
        .not('partner_hash', 'is', null);

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        return 0;
      }

      let updatedCount = 0;
      
      for (const project of projects || []) {
        if (this.isEGestorHash(project.partner_hash)) {
          const success = await this.markProjectAsEGestor(project.id);
          if (success) {
            updatedCount++;
            console.log(`Projeto ${project.id} marcado como eGestor`);
          }
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Erro ao atualizar projetos existentes:', error);
      return 0;
    }
  }
}
