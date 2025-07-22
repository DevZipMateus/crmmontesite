
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

class HostingerDNSService {
  private apiBaseUrl = 'https://developers.hostinger.com';
  
  async validateToken(apiToken: string): Promise<{ valid: boolean; message: string }> {
    try {
      console.log('Validating token against Hostinger API...');
      
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return {
          valid: true,
          message: 'Token validado com sucesso! Você pode gerenciar seus registros DNS.'
        };
      } else {
        const status = response.status;
        
        if (status === 401) {
          return {
            valid: false,
            message: 'Token inválido ou expirado. Verifique suas credenciais no painel da Hostinger.'
          };
        } else if (status === 403) {
          return {
            valid: false,
            message: 'Seu token não tem permissões para acessar a API de DNS. Verifique suas permissões no painel da Hostinger.'
          };
        } else if (status === 429) {
          return {
            valid: false,
            message: 'Limite de requisições excedido. Tente novamente mais tarde.'
          };
        } else {
          console.error('API response:', await response.text());
          return {
            valid: false,
            message: `Erro ao validar token (${status}). A API pode estar indisponível ou suas permissões são insuficientes.`
          };
        }
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return { 
        valid: false, 
        message: 'Erro ao conectar com a API da Hostinger. Verifique sua conexão e tente novamente.' 
      };
    }
  }

  async listAvailableDomains(apiToken: string): Promise<HostingerDomain[]> {
    try {
      // Use the portfolio endpoint to get domains
      const response = await fetch(`${this.apiBaseUrl}/api/domains/v1/portfolio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.map((domain: any) => ({
          domain: domain.domain,
          status: domain.status || 'active'
        }));
      } else {
        console.error('Failed to fetch domains:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  async testDomainAccess(domain: string, apiToken: string): Promise<{ accessible: boolean; message: string; recordCount?: number }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones/${domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const recordCount = Array.isArray(data) ? data.length : 0;
        
        return {
          accessible: true,
          message: `Acesso confirmado. ${recordCount} registros DNS encontrados.`,
          recordCount
        };
      } else {
        const status = response.status;
        
        if (status === 401 || status === 403) {
          return {
            accessible: false,
            message: 'Sem permissão para acessar este domínio. Verifique suas credenciais.'
          };
        } else if (status === 404) {
          return {
            accessible: false,
            message: 'Domínio não encontrado na sua conta Hostinger.'
          };
        } else {
          return {
            accessible: false,
            message: `Erro ao acessar domínio (${status}). Verifique se o domínio está ativo na sua conta Hostinger.`
          };
        }
      }
    } catch (error) {
      console.error('Error testing domain access:', error);
      return {
        accessible: false,
        message: 'Erro ao conectar com a API da Hostinger. Verifique sua conexão.'
      };
    }
  }

  async listDNSRecords(domain: string, apiToken: string): Promise<DNSRecord[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones/${domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform the response to our DNSRecord format
        const records: DNSRecord[] = [];
        
        if (Array.isArray(data)) {
          data.forEach((record: any) => {
            if (record.records && Array.isArray(record.records)) {
              record.records.forEach((content: any, index: number) => {
                if (!content.is_disabled) {
                  records.push({
                    id: `${record.name}-${record.type}-${index}`,
                    type: record.type,
                    name: record.name,
                    content: content.content,
                    ttl: record.ttl
                  });
                }
              });
            }
          });
        }
        
        return records;
      } else {
        console.error('Failed to fetch DNS records:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      return [];
    }
  }

  async updateDNSRecord(
    domain: string, 
    recordId: string, 
    recordData: Partial<DNSRecord>, 
    apiToken: string
  ): Promise<boolean> {
    try {
      // First, get all current records to find the one to update
      const allRecords = await this.listDNSRecords(domain, apiToken);
      const recordToUpdate = allRecords.find(r => r.id === recordId);
      
      if (!recordToUpdate) {
        console.error('Record not found for update');
        return false;
      }
      
      // Create the update payload
      const updatePayload = {
        overwrite: false,
        zone: [
          {
            name: recordData.name || recordToUpdate.name,
            type: recordData.type || recordToUpdate.type,
            ttl: recordData.ttl || recordToUpdate.ttl,
            records: [
              {
                content: recordData.content || recordToUpdate.content
              }
            ]
          }
        ]
      };
      
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones/${domain}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (response.ok) {
        return true;
      } else {
        console.error('Failed to update DNS record:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating DNS record:', error);
      return false;
    }
  }

  async createARecord(domain: string, name: string, ip: string, ttl: number, apiToken: string): Promise<boolean> {
    try {
      const createPayload = {
        overwrite: false,
        zone: [
          {
            name: name,
            type: 'A',
            ttl: ttl,
            records: [
              {
                content: ip
              }
            ]
          }
        ]
      };
      
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones/${domain}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPayload)
      });
      
      if (response.ok) {
        return true;
      } else {
        console.error('Failed to create A record:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error creating A record:', error);
      return false;
    }
  }

  async updateARecords(domain: string, newIP: string, apiToken: string): Promise<boolean> {
    try {
      // First, get all current A records
      const allRecords = await this.listDNSRecords(domain, apiToken);
      const aRecords = allRecords.filter(r => r.type === 'A');
      
      if (aRecords.length === 0) {
        console.error('No A records found to update');
        return false;
      }
      
      // Create update payload for all A records
      const updatePayload = {
        overwrite: false,
        zone: aRecords.map(record => ({
          name: record.name,
          type: 'A',
          ttl: record.ttl,
          records: [
            {
              content: newIP
            }
          ]
        }))
      };
      
      const response = await fetch(`${this.apiBaseUrl}/api/dns/v1/zones/${domain}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (response.ok) {
        return true;
      } else {
        console.error('Failed to update A records:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating A records:', error);
      return false;
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
      `Verifique se "${domain}" está ativo na sua conta Hostinger`,
      'Confirme que seu token API tem permissões para gerenciar DNS',
      'Certifique-se que o token não está expirado',
      'Se necessário, utilize o hPanel para gerenciar registros DNS manualmente',
      'Verifique a propagação com ferramentas como DNSChecker.org',
      'Para suporte API, contate a Hostinger em developers.hostinger.com'
    ];
  }
}

export const hostingerDNSService = new HostingerDNSService();
