
import { supabase } from '@/integrations/supabase/client';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

interface HostingerDNSResponse {
  success: boolean;
  data: DNSRecord[];
  message?: string;
}

interface HostingerUpdateResponse {
  success: boolean;
  message: string;
}

class HostingerDNSService {
  private async makeProxyRequest(domain: string, options: {
    method?: string;
    recordId?: string;
    body?: any;
    apiToken: string;
  }) {
    const { data, error } = await supabase.functions.invoke('hostinger-dns-proxy', {
      body: {
        domain,
        recordId: options.recordId,
        method: options.method || 'GET',
        body: options.body,
        apiToken: options.apiToken
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

  async listDNSRecords(domain: string, apiToken: string): Promise<DNSRecord[]> {
    try {
      console.log(`Listing DNS records for domain: ${domain}`);
      
      const response = await this.makeProxyRequest(domain, {
        method: 'GET',
        apiToken
      });

      console.log('DNS records response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error listing DNS records:', error);
      throw new Error(`Erro ao listar registros DNS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      
      const response = await this.makeProxyRequest(domain, {
        method: 'PUT',
        recordId,
        body: recordData,
        apiToken
      });

      console.log('Update DNS record response:', response);
      return response.success;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw new Error(`Erro ao atualizar registro DNS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createARecord(domain: string, name: string, ip: string, ttl: number, apiToken: string): Promise<boolean> {
    try {
      console.log(`Creating A record for domain: ${domain}`, { name, ip, ttl });
      
      const response = await this.makeProxyRequest(domain, {
        method: 'POST',
        body: {
          type: 'A',
          name,
          content: ip,
          ttl,
        },
        apiToken
      });

      console.log('Create A record response:', response);
      return response.success;
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
      
      // Update each A record
      const updatePromises = aRecords.map(record =>
        this.updateDNSRecord(domain, record.id, { content: newIP }, apiToken)
      );

      const results = await Promise.all(updatePromises);
      const success = results.every(result => result === true);
      
      console.log(`Update A records results:`, results, `Overall success: ${success}`);
      return success;
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
}

export const hostingerDNSService = new HostingerDNSService();
