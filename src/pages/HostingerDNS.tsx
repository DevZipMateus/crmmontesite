import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Settings, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import TokenValidator from '@/components/hostinger/TokenValidator';
import DomainDebugger from '@/components/hostinger/DomainDebugger';
import { hostingerDNSService } from '@/services/hostingerDNSService';

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

    if (!tokenValidation?.valid) {
      addLog('', 'error', 'Token API não foi validado ou é inválido');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Valide seu token API antes de continuar"
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

    for (const domain of domainList) {
      try {
        const success = await hostingerDNSService.updateARecords(
          domain.trim(), 
          newIP.trim(), 
          apiToken.trim()
        );

        if (success) {
          addLog(domain.trim(), 'success', `DNS atualizado para IP ${newIP}`);
          successCount++;
        } else {
          addLog(domain.trim(), 'error', 'Falha ao atualizar registros DNS');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(domain.trim(), 'error', errorMessage);
      }
    }

    setIsLoading(false);
    
    if (successCount > 0) {
      toast({
        title: "Sucesso",
        description: `${successCount} domínio(s) atualizado(s) com sucesso`
      });
    }
  };

  const handleListDNS = async () => {
    if (!validateInputs(false)) return;

    setIsLoading(true);
    const domainList = domains.split('\n').filter(d => d.trim());
    const records: { domain: string; records: DNSRecord[] }[] = [];

    for (const domain of domainList) {
      try {
        const domainRecords = await hostingerDNSService.listDNSRecords(
          domain.trim(), 
          apiToken.trim()
        );

        records.push({ domain: domain.trim(), records: domainRecords });
        addLog(domain.trim(), 'success', `${domainRecords.length} registros DNS encontrados`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(domain.trim(), 'error', errorMessage);
        records.push({ domain: domain.trim(), records: [] });
      }
    }

    setDnsRecords(records);
    setIsLoading(false);

    toast({
      title: "Listagem concluída",
      description: `Registros DNS listados para ${domainList.length} domínio(s)`
    });
  };

  const refreshDNS = async (domain: string) => {
    if (!apiToken.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Token API é obrigatório"
      });
      return;
    }

    try {
      const domainRecords = await hostingerDNSService.listDNSRecords(domain, apiToken.trim());
      
      setDnsRecords(prev => 
        prev.map(record => 
          record.domain === domain 
            ? { ...record, records: domainRecords }
            : record
        )
      );

      addLog(domain, 'success', `Registros DNS atualizados - ${domainRecords.length} registros encontrados`);
      
      toast({
        title: "Atualizado",
        description: `Registros DNS atualizados para ${domain}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(domain, 'error', errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Falha ao atualizar registros de ${domain}`
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="management">Gerenciamento</TabsTrigger>
              <TabsTrigger value="validation">Validação</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <TabsContent value="management" className="space-y-6">
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
                      {tokenValidation && (
                        <div className="mt-2">
                          <Badge variant={tokenValidation.valid ? "default" : "destructive"}>
                            {tokenValidation.valid ? 'Token Válido' : 'Token Inválido'}
                          </Badge>
                        </div>
                      )}
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
                        disabled={isLoading || !tokenValidation?.valid}
                        variant="outline"
                      >
                        {isLoading ? 'Carregando...' : 'Listar DNS'}
                      </Button>
                      <Button 
                        onClick={handleUpdateDNS} 
                        disabled={isLoading || !tokenValidation?.valid}
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
                      Registros DNS encontrados nos domínios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dnsRecords.map((domainRecord, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">{domainRecord.domain}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refreshDNS(domainRecord.domain)}
                              disabled={isLoading}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Atualizar
                            </Button>
                          </div>
                          {domainRecord.records.length > 0 ? (
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
                          ) : (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Nenhum registro DNS encontrado para este domínio.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <TokenValidator 
                apiToken={apiToken} 
                onValidationResult={setTokenValidation}
              />
            </TabsContent>

            <TabsContent value="debug" className="space-y-6">
              <DomainDebugger apiToken={apiToken} />
              
              {tokenValidation && !tokenValidation.valid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Token inválido detectado</p>
                      <p>Para usar as ferramentas de debug, primeiro valide seu token na aba "Validação".</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default HostingerDNS;
