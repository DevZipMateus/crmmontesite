
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
    addLog('', 'error', 'API Hostinger DNS não disponível publicamente. Veja a guia "API Status" para mais informações.');
    
    toast({
      variant: "destructive",
      title: "API Indisponível",
      description: "A API de DNS da Hostinger não está disponível publicamente. Veja alternativas na guia 'API Status'."
    });
    
    setIsLoading(false);
  };

  const handleListDNS = async () => {
    if (!validateInputs(false)) return;

    setIsLoading(true);
    addLog('', 'error', 'API Hostinger DNS não disponível publicamente. Veja a guia "API Status" para mais informações.');
    
    toast({
      variant: "destructive",
      title: "API Indisponível",
      description: "A API de DNS da Hostinger não está disponível publicamente. Veja alternativas na guia 'API Status'."
    });
    
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

          <Tabs defaultValue="management" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="management">Gerenciamento</TabsTrigger>
              <TabsTrigger value="apiStatus">API Status</TabsTrigger>
              <TabsTrigger value="alternatives">Alternativas</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <TabsContent value="management" className="space-y-6">
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>API Indisponível</AlertTitle>
                <AlertDescription>
                  Nossa investigação indica que a API de DNS da Hostinger não está disponível publicamente.
                  Por favor, verifique a guia "API Status" para mais informações e alternativas.
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
                  As ferramentas de debug são limitadas devido à indisponibilidade da API pública.
                  Recomendamos utilizar o painel de controle da Hostinger diretamente.
                </AlertDescription>
              </Alert>
              
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
