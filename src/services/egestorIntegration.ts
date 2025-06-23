
import { supabase } from "@/integrations/supabase/client";
import { AuthTokenService } from "./authTokenService";

export interface EGestorPartner {
  id: string;
  name: string;
  hash: string;
  webhook_url: string;
  auth_token: string;
  active: boolean;
}

export class EGestorIntegrationService {
  private static readonly EGESTOR_CONFIG = {
    name: "eGestor - Painel Parceiros",
    hash: "egestor_painel_parceiros",
    webhook_url: "https://v4.egestor.com.br/parceiros2/webhook_receiver.php",
    auth_token: "whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12"
  };

  // Criar ou atualizar o parceiro eGestor
  static async ensureEGestorPartner(): Promise<EGestorPartner> {
    // Verificar se já existe
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('*')
      .eq('hash', this.EGESTOR_CONFIG.hash)
      .single();

    if (existingPartner) {
      // Atualizar se necessário
      const { data: updatedPartner, error } = await supabase
        .from('partners')
        .update({
          name: this.EGESTOR_CONFIG.name,
          webhook_url: this.EGESTOR_CONFIG.webhook_url,
          auth_token: this.EGESTOR_CONFIG.auth_token,
          token_hash: await AuthTokenService.hashToken(this.EGESTOR_CONFIG.auth_token),
          token_expires_at: null, // Token permanente
          active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPartner.id)
        .select()
        .single();

      if (error) throw error;
      return updatedPartner;
    } else {
      // Criar novo
      const { data: newPartner, error } = await supabase
        .from('partners')
        .insert({
          name: this.EGESTOR_CONFIG.name,
          hash: this.EGESTOR_CONFIG.hash,
          webhook_url: this.EGESTOR_CONFIG.webhook_url,
          auth_token: this.EGESTOR_CONFIG.auth_token,
          token_hash: await AuthTokenService.hashToken(this.EGESTOR_CONFIG.auth_token),
          token_expires_at: null, // Token permanente
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      return newPartner;
    }
  }

  // Validar se um token pertence ao eGestor
  static async validateEGestorToken(token: string): Promise<boolean> {
    return token === this.EGESTOR_CONFIG.auth_token;
  }

  // Testar conexão com o webhook do eGestor
  static async testWebhookConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testPayload = {
        type: 'test',
        message: 'Teste de conexão do sistema',
        timestamp: new Date().toISOString(),
        source: 'MonteSite CRM'
      };

      const response = await fetch(this.EGESTOR_CONFIG.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.EGESTOR_CONFIG.auth_token}`
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Conexão com eGestor estabelecida com sucesso'
        };
      } else {
        return {
          success: false,
          message: `Erro na conexão: HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // Obter informações do parceiro eGestor
  static async getEGestorPartnerInfo(): Promise<EGestorPartner | null> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('hash', this.EGESTOR_CONFIG.hash)
      .single();

    if (error || !data) return null;
    return data;
  }
}
