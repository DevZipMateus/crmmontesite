
import { supabase } from "@/integrations/supabase/client";
import { createHash } from 'crypto';

export interface AuthToken {
  token: string;
  hash: string;
  expiresAt?: Date;
}

export interface AuthLog {
  id: string;
  partner_id: string;
  token_used: string;
  request_ip?: string;
  request_headers?: any;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export class AuthTokenService {
  // Gerar novo token
  static generateToken(): AuthToken {
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 10);
    
    const hash = this.hashToken(token);
    
    return {
      token,
      hash,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    };
  }

  // Hash do token para armazenamento seguro
  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Salvar token para parceiro
  static async saveTokenForPartner(partnerId: string, authToken: AuthToken) {
    const { error } = await supabase
      .from('partners')
      .update({
        token_hash: authToken.hash,
        token_expires_at: authToken.expiresAt?.toISOString(),
        auth_token: authToken.token // Manter para exibição (será removido após primeira visualização)
      })
      .eq('id', partnerId);

    if (error) throw error;
    return authToken;
  }

  // Validar token
  static async validateToken(token: string): Promise<{
    isValid: boolean;
    partnerId?: string;
    partnerName?: string;
    errorMessage?: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('validate_auth_token', { token_input: token });

      if (error) throw error;

      const result = data?.[0];
      return {
        isValid: result?.is_valid || false,
        partnerId: result?.partner_id,
        partnerName: result?.partner_name
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        isValid: false,
        errorMessage: 'Erro interno na validação do token'
      };
    }
  }

  // Registrar tentativa de autenticação
  static async logAuthAttempt(data: {
    partnerId?: string;
    tokenUsed: string;
    requestIp?: string;
    requestHeaders?: any;
    success: boolean;
    errorMessage?: string;
  }) {
    try {
      const { error } = await supabase
        .from('auth_logs')
        .insert({
          partner_id: data.partnerId,
          token_used: data.tokenUsed.substring(0, 10) + '...', // Log apenas parte do token
          request_ip: data.requestIp,
          request_headers: data.requestHeaders,
          success: data.success,
          error_message: data.errorMessage
        });

      if (error) {
        console.error('Error logging auth attempt:', error);
      }
    } catch (error) {
      console.error('Error logging auth attempt:', error);
    }
  }

  // Buscar logs de autenticação
  static async getAuthLogs(limit: number = 50): Promise<AuthLog[]> {
    const { data, error } = await supabase
      .from('auth_logs')
      .select(`
        *,
        partners(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Revogar token
  static async revokeToken(partnerId: string) {
    const { error } = await supabase
      .from('partners')
      .update({
        token_hash: null,
        token_expires_at: null,
        auth_token: null
      })
      .eq('id', partnerId);

    if (error) throw error;
  }
}
