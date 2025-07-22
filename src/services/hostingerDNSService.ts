import { supabase } from '@/integrations/supabase/client';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

interface HostingerDomain {
  domain: string;
  status: string;
}

interface HostingerZoneRecord {
  name: string;
  records: Array<{
    content: string;
    is_disabled?: boolean;
  }>;
  ttl: number;
  type: string;
}

interface HostingerZoneUpdatePayload {
  overwrite: boolean;
  zone: Array<{
    name: string;
    records: Array<{
      content: string;
    }>;
    ttl: number;
    type: string;
  }>;
}

class HostingerDNSService {
  private async makeProxyRequest(domain: string, options: {
    method?: string;
    body?: any;
    apiToken: string;
    validateTokenOnly?: boolean;
    listDomains?: boolean;
  }) {
    const { data, error } = await supabase.functions.invoke('hostinger-dns-proxy', {
      body: {
        domain,
        method: options.method || 'GET',
        body: options.body,
        apiToken: options.apiToken,
        validateTokenOnly: options.validateTokenOnly || false,
        listDomains: options.listDomains || false
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Erro na comunicação com o servidor: ${error.message}`);
    }

    if (data.error) {
      console.error('Hostinger API error:', data);
      throw new Error(data.error);
    }

    return data;
  }

  private convertHostingerRecordsToFrontend(hostingerRecords: HostingerZoneRecord[]): DNSRecord[] {
    const frontendRecords: DNSRecord[] = [];
    
    hostingerRecords.forEach((zoneRecord) => {
      zoneRecord.records.forEach((record, index) => {
        if (!record.is_disabled) {
          frontendRecords.push({
            id: `${zoneRecord.type}-${zoneRecord.name}-${index}`, // Generate unique ID
            type: zoneRecord.type,
            name: zoneRecord.name,
            content: record.content,
            ttl: zoneRecord.ttl
          });
        }
      });
    });

    return frontendRecords;
  }

  private convertFrontendRecordsToHostinger(records: DNSRecord[]): HostingerZoneRecord[] {
    const recordMap = new Map<string, HostingerZoneRecord>();

    records.forEach((record) => {
      const key = `${record.type}-${record.name}-${record.ttl}`;
      
      if (recordMap.has(key)) {
        recordMap.get(key)!.records.push({ content: record.content });
      } else {
        recordMap.set(key, {
          name: record.name,
          type: record.type,
          ttl: record.ttl,
          records: [{ content: record.content }]
        });
      }
    });

    return Array.from(recordMap.values());
  }

  async validateToken(apiToken: string): Promise<{ valid: boolean; message: string }> {
    try {
      console.log('Validating token...');
      
      const result = await this.makeProxyRequest('', {
        method: 'GET',
        apiToken,
        validateTokenOnly: true
      });

      console.log('Token validation result:', result);
      
      if (result.valid) {
        return { valid: true, message: result.message || 'Token válido' };
      } else {
        return { valid: false, message: result.message || 'Token inválido' };
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('Token API inválido') || errorMessage.includes('authentication')) {
        return { valid: false, message: 'Token API inválido ou expirado' };
      } else if (errorMessage.includes('sem permissões adequadas')) {
        return { valid: false, message: 'Token sem permissões para acessar a API DNS' };
      } else if (errorMessage.includes('conectividade')) {
        return { valid: false, message: 'Erro de conectividade com a API Hostinger' };
      } else {
        return { valid: false, message: `Erro ao validar token: ${errorMessage}` };
      }
    }
  }

  async listAvailableDomains(apiToken: string): Promise<HostingerDomain[]> {
    try {
      console.log('Listing available domains...');
      
      const result = await this.makeProxyRequest('', {
        method: 'GET',
        apiToken,
        listDomains: true
      });

      console.log('Available domains result:', result);
      
      // The API might return different structures, handle them gracefully
      if (Array.isArray(result)) {
        return result.map(domain => ({
          domain: typeof domain === 'string' ? domain : domain.domain || domain.name,
          status: typeof domain === 'object' ? domain.status || 'active' : 'active'
        }));
      }
      
      if (result.data && Array.isArray(result.data)) {
        return result.data.map(domain => ({
          domain: domain.domain || domain.name,
          status: domain.status || 'active'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error listing domains:', error);
      throw new Error(`Erro ao listar domínios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async testDomainAccess(domain: string, apiToken: string): Promise<{ accessible: boolean; message: string; recordCount?: number }> {
    try {
      const records = await this.listDNSRecords(domain, apiToken);
      return {
        accessible: true,
        message: `Domínio acessível com sucesso`,
        recordCount: records.length
      };
    } catch (error) {
      console.error('Domain access test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        accessible: false,
        message: errorMessage
      };
    }
  }

  async listDNSRecords(domain: string, apiToken: string): Promise<DNSRecord[]> {
    try {
      console.log(`Listing DNS records for domain: ${domain}`);
      
      const response = await this.makeProxyRequest(domain, {
        method: 'GET',
        apiToken
      });

      console.log('DNS records response:', response);
      
      // Handle different response formats from Hostinger API v3
      if (response.data && Array.isArray(response.data)) {
        // Convert v3 format to frontend format
        return response.data.map((record, index) => ({
          id: record.id || `${record.type}-${record.name}-${index}`,
          type: record.type,
          name: record.name,
          content: record.content || record.value,
          ttl: record.ttl || 3600
        }));
      }
      
      // Fallback for other formats
      if (Array.isArray(response)) {
        return this.convertHostingerRecordsToFrontend(response);
      }
      
      return [];
    } catch (error) {
      console.error('Error listing DNS records:', error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('não foi encontrado') || errorMessage.includes('not found')) {
        throw new Error(`❌ DOMÍNIO NÃO ENCONTRADO

O domínio "${domain}" não foi encontrado na sua conta Hostinger DNS.

🔍 POSSÍVEIS CAUSAS:
• O domínio não está adicionado à sua conta Hostinger
• O domínio está em uma conta Hostinger diferente
• O token API foi gerado em uma conta diferente
• O domínio foi removido ou transferido recentemente

✅ COMO RESOLVER:
1. Verifique se você está logado na conta Hostinger CORRETA
2. Acesse o painel DNS da Hostinger e confirme se o domínio aparece na lista
3. Se o domínio está em outra conta, gere um novo token API na conta correta
4. Use a funcionalidade "Listar Domínios" para ver quais domínios estão disponíveis

💡 DICA: Clique em "Listar Domínios Disponíveis" na aba Debug para ver todos os domínios da sua conta.`);
      } else if (errorMessage.includes('Token API inválido')) {
        throw new Error('Token API inválido. Verifique se o token foi copiado corretamente e não expirou.');
      } else if (errorMessage.includes('rate limit')) {
        throw new Error('Limite de requisições atingido. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        throw new Error(`Erro ao listar registros DNS: ${errorMessage}`);
      }
    }
  }

  async updateDNSRecord(
    domain: string, 
    recordId: string, 
    recordData: Partial<DNSRecord>, 
    apiToken: string
  ): Promise<boolean> {
    try {
      console.log(`Updating DNS record ${recordId} for domain: ${domain}`, recordData);
      
      // First get all current records
      const currentRecords = await this.listDNSRecords(domain, apiToken);
      
      // Update the specific record
      const updatedRecords = currentRecords.map(record => 
        record.id === recordId ? { ...record, ...recordData } : record
      );
      
      // Convert to Hostinger format and update
      const hostingerRecords = this.convertFrontendRecordsToHostinger(updatedRecords);
      
      const updatePayload: HostingerZoneUpdatePayload = {
        overwrite: true,
        zone: hostingerRecords
      };

      const response = await this.makeProxyRequest(domain, {
        method: 'PUT',
        body: updatePayload,
        apiToken
      });

      console.log('Update DNS record response:', response);
      return response.message === 'Request accepted';
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw new Error(`Erro ao atualizar registro DNS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createARecord(domain: string, name: string, ip: string, ttl: number, apiToken: string): Promise<boolean> {
    try {
      console.log(`Creating A record for domain: ${domain}`, { name, ip, ttl });
      
      // Get current records first
      const currentRecords = await this.listDNSRecords(domain, apiToken);
      
      // Add new A record
      const newRecord: DNSRecord = {
        id: `A-${name}-${Date.now()}`, // Temporary ID
        type: 'A',
        name,
        content: ip,
        ttl
      };
      
      const allRecords = [...currentRecords, newRecord];
      const hostingerRecords = this.convertFrontendRecordsToHostinger(allRecords);
      
      const updatePayload: HostingerZoneUpdatePayload = {
        overwrite: false, // Don't overwrite, just add
        zone: hostingerRecords
      };

      const response = await this.makeProxyRequest(domain, {
        method: 'PUT',
        body: updatePayload,
        apiToken
      });

      console.log('Create A record response:', response);
      return response.message === 'Request accepted';
    } catch (error) {
      console.error('Error creating A record:', error);
      throw new Error(`Erro ao criar registro A: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateARecords(domain: string, newIP: string, apiToken: string): Promise<boolean> {
    try {
      console.log(`Updating A records for domain: ${domain} to IP: ${newIP}`);
      
      // First, get all DNS records
      const records = await this.listDNSRecords(domain, apiToken);
      
      // Find A records to update
      const aRecords = records.filter(record => record.type === 'A');
      console.log(`Found ${aRecords.length} A records to update:`, aRecords);
      
      if (aRecords.length === 0) {
        throw new Error('Nenhum registro A encontrado para atualizar');
      }
      
      // Update A records with new IP
      const updatedRecords = records.map(record => 
        record.type === 'A' ? { ...record, content: newIP } : record
      );
      
      // Convert to Hostinger format
      const hostingerRecords = this.convertFrontendRecordsToHostinger(updatedRecords);
      
      const updatePayload: HostingerZoneUpdatePayload = {
        overwrite: true,
        zone: hostingerRecords
      };

      const response = await this.makeProxyRequest(domain, {
        method: 'PUT',
        body: updatePayload,
        apiToken
      });

      console.log('Update A records response:', response);
      return response.message === 'Request accepted';
    } catch (error) {
      console.error('Error updating A records:', error);
      throw new Error(`Erro ao atualizar registros A: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/;
    return domainRegex.test(domain.trim());
  }

  validateIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip.trim());
  }

  validateApiToken(token: string): boolean {
    // Basic token format validation
    return token.trim().length > 0 && !token.includes(' ');
  }

  getDomainTroubleshootingSteps(domain: string): string[] {
    return [
      `Verifique se "${domain}" está na sua conta Hostinger`,
      'Confirme se você tem permissões de administrador na conta',
      'Verifique se o domínio está ativo e não suspenso',
      'Certifique-se de que o DNS está sendo gerenciado pela Hostinger',
      'Teste com outro domínio da sua conta para confirmar o token',
      'Se necessário, entre em contato com o suporte da Hostinger'
    ];
  }
}

export const hostingerDNSService = new HostingerDNSService();
