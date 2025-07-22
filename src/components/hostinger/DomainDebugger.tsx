
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
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

    if (!apiToken.trim()) {
      setDebugResult({
        success: false,
        message: 'Token API é obrigatório para o teste'
      });
      return;
    }

    setIsDebugging(true);
    try {
      const records = await hostingerDNSService.listDNSRecords(testDomain.trim(), apiToken.trim());
      setDebugResult({
        success: true,
        message: `Sucesso! Encontrados ${records.length} registros DNS para ${testDomain}`,
        details: records
      });
    } catch (error) {
      setDebugResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const getErrorSuggestions = (message: string) => {
    if (message.includes('não pertence à sua conta') || message.includes('4002')) {
      return [
        'Verifique se o domínio está na sua conta Hostinger',
        'Confirme se você tem permissões de administrador',
        'Verifique se o domínio está ativo e configurado',
        'Teste com outro domínio da sua conta'
      ];
    } else if (message.includes('Token API inválido') || message.includes('authentication')) {
      return [
        'Gere um novo token API no painel da Hostinger',
        'Verifique se copiou o token completo',
        'Confirme se o token não expirou',
        'Verifique se você tem as permissões necessárias'
      ];
    } else if (message.includes('rate limit')) {
      return [
        'Aguarde alguns minutos antes de tentar novamente',
        'Reduza a frequência das requisições',
        'Verifique se não há outras aplicações usando a API'
      ];
    }
    return [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns minutos',
      'Verifique se a API da Hostinger está funcionando'
    ];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Debug de Domínio
        </CardTitle>
        <CardDescription>
          Teste a conectividade e permissões para um domínio específico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testDomain">Domínio para Teste</Label>
          <Input
            id="testDomain"
            placeholder="exemplo.com"
            value={testDomain}
            onChange={(e) => setTestDomain(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleDebugDomain} 
          disabled={isDebugging || !testDomain.trim() || !apiToken.trim()}
          className="w-full"
        >
          {isDebugging ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Testar Domínio
            </>
          )}
        </Button>

        {debugResult && (
          <Alert className={debugResult.success ? 'border-green-200' : 'border-red-200'}>
            <div className="flex items-start gap-2">
              {debugResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={debugResult.success ? "default" : "destructive"}>
                    {debugResult.success ? 'Sucesso' : 'Erro'}
                  </Badge>
                </div>
                <AlertDescription>
                  {debugResult.message}
                </AlertDescription>
                {!debugResult.success && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium mb-1">Sugestões para resolver:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {getErrorSuggestions(debugResult.message).map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainDebugger;
