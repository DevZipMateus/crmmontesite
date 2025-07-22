
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Settings, AlertTriangle, CheckCircle, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import TokenValidator from '@/components/hostinger/TokenValidator';
import DomainDebugger from '@/components/hostinger/DomainDebugger';
import { hostingerDNSService } from '@/services/hostingerDNSService';
import ApiStatusCard from '@/components/hostinger/ApiStatusCard';
import AlternativesCard from '@/components/hostinger/AlternativesCard';

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
  const [tokenValidation, setTokenValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const addLog = (domain: string, status: 'success' | 'error', message: string) => {
    setLogs(prev => [...prev, {
      domain,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const validateInputs = (requireIP = false) => {
    if (!apiToken.trim()) {
      addLog('', 'error', 'Token API é obrigatório');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Token API é obrigatório"
      });
      return false;
    }

    if (!domains.trim()) {
      addLog('', 'error', 'Pelo menos um domínio é obrigatório');
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "Pelo menos um domínio é obrigatório"
      });
      return false;
    }

    if (requireIP && !newIP.trim()) {
      addLog('', 'error', 'Novo IP é obrigatório para atualização');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Novo IP é obrigatório para atualização"
      });
      return false;
    }

    const domainList = domains.split('\n').filter(d => d.trim());
    for (const domain of domainList) {
      if (!hostingerDNSService.validateDomain(domain.trim())) {
        addLog(domain.trim(), 'error', 'Formato de domínio inválido');
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Formato de domínio inválido: ${domain.trim()}`
        });
        return false;
      }
    }

    if (requireIP && !hostingerDNSService.validateIP(newIP.trim())) {
      addLog('', 'error', 'Formato de IP inválido');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Formato de IP inválido"
      });
      return false;
    }

    return true;
  };

  const handleUpdateDNS = async () => {
    if (!validateInputs(true)) return;

    setIsLoading(true);
    const domainList = domains.split('\n').filter(d => d.trim());
    let successCount = 0;
    let errorCount = 0;

    for (const domain of domainList) {
      try {
        const result = await hostingerDNSService.updateARecords(domain.trim(), newIP.trim(), apiToken);
        
        if (result) {
          addLog(domain.trim(), 'success', `Registros A atualizados com sucesso para o IP ${newIP}`);
          successCount++;
        } else {
          addLog(domain.trim(), 'error', 'Falha ao atualizar registros A');
          errorCount++;
        }
      } catch (error) {
        addLog(domain.trim(), 'error', `Erro: ${error instanceof Error ? error.message : String(error)}`);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Atualização concluída",
        description: `${successCount} domínio(s) atualizado(s) com sucesso${errorCount > 0 ? `, ${errorCount} com erro(s)` : ''}`
      });
    } else {
      toast({
        variant: "destructive",
        title: "Falha na atualização",
        description: "Nenhum domínio foi atualizado. Verifique os logs para mais detalhes."
      });
    }
    
    setIsLoading(false);
  };

  const handleListDNS = async () => {
    if (!validateInputs(false)) return;

    setIsLoading(true);
    setDnsRecords([]);
    const domainList = domains.split('\n').filter(d => d.trim());
    let successCount = 0;
    let recordCount = 0;

    for (const domain of domainList) {
      try {
        const records = await hostingerDNSService.listDNSRecords(domain.trim(), apiToken);
        
        if (records.length > 0) {
          setDnsRecords(prev => [...prev, { domain: domain.trim(), records }]);
          addLog(domain.trim(), 'success', `${records.length} registro(s) DNS encontrado(s)`);
          successCount++;
          recordCount += records.length;
        } else {
          addLog(domain.trim(), 'error', 'Nenhum registro DNS encontrado');
        }
      } catch (error) {
        addLog(domain.trim(), 'error', `Erro: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Registros DNS carregados",
        description: `${recordCount} registro(s) encontrado(s) em ${successCount} domínio(s)`
      });
    } else {
      toast({
        variant: "destructive",
        title: "Falha ao listar registros",
        description: "Nenhum registro DNS foi encontrado. Verifique os logs para mais detalhes."
      });
    }
    
    setIsLoading(false);
  };

  const handleTokenValidationResult = (result: { valid: boolean; message: string }) => {
    setTokenValidation(result);
    
    if (result.valid) {
      toast({
        title: "Token validado",
        description: "Seu token API foi validado com sucesso"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Problema com o token",
        description: result.message
      });
    }
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

          <Tabs defaultValue="management" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="management">Gerenciamento</TabsTrigger>
              <TabsTrigger value="apiStatus">API Status</TabsTrigger>
              <TabsTrigger value="alternatives">Alternativas</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <TabsContent value="management" className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Acesso à API Hostinger</AlertTitle>
                <AlertDescription>
                  A API DNS da Hostinger requer um token de API com permissões específicas. 
                  Caso encontre dificuldades, verifique a guia "API Status" para mais informações 
                  ou utilize o painel de controle da Hostinger (hPanel) para gerenciamento manual.
                </AlertDescription>
              </Alert>

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
                        {isLoading ? 'Carregando...' : 'Listar DNS'}
                      </Button>
                      <Button 
                        onClick={handleUpdateDNS} 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Atualizando...' : 'Atualizar DNS'}
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
                        logs.slice().reverse().map((log, index) => (
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
                      Registros DNS encontrados nos domínios consultados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      {dnsRecords.map((domainRecord, domainIndex) => (
                        <div key={domainIndex} className="mb-6">
                          <h3 className="text-lg font-medium mb-2">{domainRecord.domain}</h3>
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
                              {domainRecord.records.map((record, recordIndex) => (
                                <TableRow key={recordIndex}>
                                  <TableCell>
                                    <Badge variant="outline">{record.type}</Badge>
                                  </TableCell>
                                  <TableCell>{record.name}</TableCell>
                                  <TableCell className="font-mono text-sm">{record.content}</TableCell>
                                  <TableCell>{record.ttl}</TableCell>
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
            </TabsContent>

            <TabsContent value="apiStatus">
              <ApiStatusCard />
            </TabsContent>

            <TabsContent value="alternatives">
              <AlternativesCard />
            </TabsContent>

            <TabsContent value="debug" className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use estas ferramentas para testar e depurar o acesso à API de DNS da Hostinger.
                  Caso encontre dificuldades com a API, você ainda pode gerenciar seus registros DNS 
                  manualmente através do painel de controle da Hostinger.
                </AlertDescription>
              </Alert>
              
              <TokenValidator 
                apiToken={apiToken} 
                onValidationResult={handleTokenValidationResult} 
              />
              
              <DomainDebugger apiToken={apiToken} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default HostingerDNS;
