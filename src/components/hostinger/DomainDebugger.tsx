
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, Loader2, Info, ExternalLink } from 'lucide-react';
import { hostingerDNSService } from '@/services/hostingerDNSService';

interface DomainDebuggerProps {
  apiToken: string;
}

const DomainDebugger: React.FC<DomainDebuggerProps> = ({ apiToken }) => {
  const [testDomain, setTestDomain] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleDebugDomain = async () => {
    if (!testDomain.trim()) {
      setDebugResult({
        success: false,
        message: 'Por favor, insira um domínio para testar'
      });
      return;
    }

    if (!hostingerDNSService.validateDomain(testDomain.trim())) {
      setDebugResult({
        success: false,
        message: 'Formato de domínio inválido'
      });
      return;
    }

    setIsDebugging(true);
    
    setTimeout(() => {
      setDebugResult({
        success: false,
        message: 'API de DNS da Hostinger não está disponível publicamente. Recomendamos gerenciar seus registros DNS manualmente através do painel da Hostinger (hPanel).'
      });
      setIsDebugging(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Debug de Domínio
        </CardTitle>
        <CardDescription>
          Ferramentas para teste e verificação de domínios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Gerenciamento DNS Manual</AlertTitle>
          <AlertDescription>
            Como a API de DNS da Hostinger não está disponível publicamente, você precisará gerenciar seus
            registros DNS manualmente através do painel de controle da Hostinger (hPanel).
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="testDomain">Domínio para Teste</Label>
          <div className="flex mt-1.5 gap-2">
            <Input
              id="testDomain"
              placeholder="exemplo.com"
              value={testDomain}
              onChange={(e) => setTestDomain(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleDebugDomain} 
              disabled={isDebugging || !testDomain.trim()}
            >
              {isDebugging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </div>
        </div>

        {debugResult && (
          <Alert className={debugResult.success ? 'border-green-200' : 'border-amber-200'}>
            <div className="flex items-start gap-2">
              {debugResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <Info className="h-4 w-4 text-amber-500 mt-1" />
              )}
              <div className="flex-1">
                <AlertDescription className="whitespace-pre-line">
                  {debugResult.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Guia de Gerenciamento Manual</h3>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">1. Acesse o hPanel da Hostinger</h4>
              <p className="text-sm text-gray-600 mt-1">
                Faça login na sua conta Hostinger e acesse o painel de controle (hPanel).
              </p>
              <div className="mt-2">
                <a 
                  href="https://hpanel.hostinger.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  Acessar hPanel <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">2. Navegue até as Configurações DNS</h4>
              <p className="text-sm text-gray-600 mt-1">
                Selecione seu domínio e clique em "DNS / Nameservers" ou "Zona DNS" no menu.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">3. Gerencie os Registros DNS</h4>
              <p className="text-sm text-gray-600 mt-1">
                Aqui você pode adicionar, editar ou remover registros DNS como A, CNAME, MX, etc.
                Para atualizar um IP, localize os registros tipo A e edite o valor para o novo IP.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">4. Verificação de Propagação</h4>
              <p className="text-sm text-gray-600 mt-1">
                Após fazer alterações nos registros DNS, verifique a propagação usando ferramentas como:
              </p>
              <div className="mt-2 space-y-1">
                <a 
                  href="https://dnschecker.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  DNSChecker.org <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href="https://www.whatsmydns.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  WhatsMyDNS.net <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainDebugger;
