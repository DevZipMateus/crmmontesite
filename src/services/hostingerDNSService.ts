
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
  private baseUrl = 'https://api.hostinger.com/v1';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async listDNSRecords(domain: string, apiToken: string): Promise<DNSRecord[]> {
    try {
      const response = await this.makeRequest(`/domains/${domain}/dns`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

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
      const response = await this.makeRequest(`/domains/${domain}/dns/${recordId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify(recordData),
      });

      return response.success;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw new Error(`Erro ao atualizar registro DNS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createARecord(domain: string, name: string, ip: string, ttl: number, apiToken: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/domains/${domain}/dns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          type: 'A',
          name,
          content: ip,
          ttl,
        }),
      });

      return response.success;
    } catch (error) {
      console.error('Error creating A record:', error);
      throw new Error(`Erro ao criar registro A: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateARecords(domain: string, newIP: string, apiToken: string): Promise<boolean> {
    try {
      // First, get all DNS records
      const records = await this.listDNSRecords(domain, apiToken);
      
      // Find A records to update
      const aRecords = records.filter(record => record.type === 'A');
      
      // Update each A record
      const updatePromises = aRecords.map(record =>
        this.updateDNSRecord(domain, record.id, { content: newIP }, apiToken)
      );

      const results = await Promise.all(updatePromises);
      return results.every(result => result === true);
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
