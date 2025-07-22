
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

    if (!apiToken.trim()) {
      setDebugResult({
        success: false,
        message: 'Token API é obrigatório para testar o domínio'
      });
      return;
    }

    setIsDebugging(true);
    
    try {
      const result = await hostingerDNSService.testDomainAccess(testDomain.trim(), apiToken);
      
      setDebugResult({
        success: result.accessible,
        message: result.message,
        details: result.recordCount !== undefined ? { recordCount: result.recordCount } : undefined
      });
    } catch (error) {
      setDebugResult({
        success: false,
        message: `Erro ao testar domínio: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsDebugging(false);
    }
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
              disabled={isDebugging || !testDomain.trim() || !apiToken.trim()}
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
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1" />
              )}
              <div className="flex-1">
                <AlertDescription className="whitespace-pre-line">
                  {debugResult.message}
                  {debugResult.details?.recordCount !== undefined && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-green-50">
                        {debugResult.details.recordCount} registro(s) encontrado(s)
                      </Badge>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Guia de Debug</h3>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">1. Verifique se o domínio existe na sua conta Hostinger</h4>
              <p className="text-sm text-gray-600 mt-1">
                Certifique-se de que o domínio que você está tentando gerenciar está registrado 
                e ativo na sua conta Hostinger.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">2. Verifique as permissões do seu token API</h4>
              <p className="text-sm text-gray-600 mt-1">
                O token API precisa ter permissões para gerenciar registros DNS. Caso necessário, 
                gere um novo token com as permissões adequadas.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">3. Contate o suporte da Hostinger</h4>
              <p className="text-sm text-gray-600 mt-1">
                Se você continua enfrentando problemas, entre em contato com o suporte da Hostinger
                para confirmar a disponibilidade da API de DNS para sua conta.
              </p>
              <div className="mt-2">
                <a 
                  href="https://www.hostinger.com/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  Contatar Suporte <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium text-sm">4. Alternativas ao uso da API</h4>
              <p className="text-sm text-gray-600 mt-1">
                Se você não conseguir acesso à API de DNS, considere:
              </p>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                <li>Usar o painel de controle da Hostinger (hPanel) para gerenciar seus registros DNS manualmente</li>
                <li>Migrar para provedores DNS com APIs públicas bem documentadas (veja a guia "Alternativas")</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainDebugger;
