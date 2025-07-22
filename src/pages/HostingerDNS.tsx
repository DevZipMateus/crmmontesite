
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';

interface LogEntry {
  domain: string;
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
}

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

const HostingerDNS: React.FC = () => {
  const [apiToken, setApiToken] = useState('');
  const [domains, setDomains] = useState('');
  const [newIP, setNewIP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dnsRecords, setDnsRecords] = useState<{ domain: string; records: DNSRecord[] }[]>([]);

  const addLog = (domain: string, status: 'success' | 'error', message: string) => {
    setLogs(prev => [...prev, {
      domain,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const handleUpdateDNS = async () => {
    if (!apiToken || !domains || !newIP) {
      addLog('', 'error', 'Todos os campos são obrigatórios');
      return;
    }

    setIsLoading(true);
    const domainList = domains.split('\n').filter(d => d.trim());

    for (const domain of domainList) {
      try {
        // Simulação da atualização DNS - aqui seria a chamada real para a API da Hostinger
        await new Promise(resolve => setTimeout(resolve, 1000));
        addLog(domain.trim(), 'success', `DNS atualizado para IP ${newIP}`);
      } catch (error) {
        addLog(domain.trim(), 'error', `Erro ao atualizar DNS: ${error}`);
      }
    }

    setIsLoading(false);
  };

  const handleListDNS = async () => {
    if (!apiToken || !domains) {
      addLog('', 'error', 'Token API e domínios são obrigatórios');
      return;
    }

    setIsLoading(true);
    const domainList = domains.split('\n').filter(d => d.trim());
    const records: { domain: string; records: DNSRecord[] }[] = [];

    for (const domain of domainList) {
      try {
        // Simulação da listagem DNS - aqui seria a chamada real para a API da Hostinger
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockRecords: DNSRecord[] = [
          { id: '1', type: 'A', name: '@', content: '192.168.1.1', ttl: 3600 },
          { id: '2', type: 'CNAME', name: 'www', content: domain.trim(), ttl: 3600 }
        ];
        records.push({ domain: domain.trim(), records: mockRecords });
        addLog(domain.trim(), 'success', `Registros DNS listados com sucesso`);
      } catch (error) {
        addLog(domain.trim(), 'error', `Erro ao listar DNS: ${error}`);
      }
    }

    setDnsRecords(records);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento DNS Hostinger</h1>
              <p className="text-gray-600">Gerencie registros DNS dos seus domínios na Hostinger</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração
                </CardTitle>
                <CardDescription>
                  Configure sua API Token e domínios para gerenciar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiToken">Token API Hostinger</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    placeholder="Cole seu token API aqui"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="domains">Domínios (um por linha)</Label>
                  <Textarea
                    id="domains"
                    placeholder="exemplo.com&#10;meusite.com.br"
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="newIP">Novo IP (para atualização)</Label>
                  <Input
                    id="newIP"
                    placeholder="192.168.1.1"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleListDNS} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    Listar DNS
                  </Button>
                  <Button 
                    onClick={handleUpdateDNS} 
                    disabled={isLoading}
                  >
                    Atualizar DNS
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs de Operação</CardTitle>
                <CardDescription>
                  Histórico das operações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma operação realizada ainda</p>
                  ) : (
                    logs.map((log, index) => (
                      <Alert key={index} className={log.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                        <div className="flex items-start gap-2">
                          {log.status === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <AlertDescription>
                              <div className="font-medium">{log.domain || 'Sistema'}</div>
                              <div className="text-sm">{log.message}</div>
                              <div className="text-xs text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {dnsRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registros DNS</CardTitle>
                <CardDescription>
                  Registros DNS encontrados nos domínios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dnsRecords.map((domainRecord, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-lg mb-3">{domainRecord.domain}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Conteúdo</TableHead>
                            <TableHead>TTL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domainRecord.records.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <Badge variant="outline">{record.type}</Badge>
                              </TableCell>
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.content}</TableCell>
                              <TableCell>{record.ttl}s</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default HostingerDNS;
