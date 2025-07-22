
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react';
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
        message: `✅ Sucesso! Encontrados ${records.length} registros DNS para ${testDomain}`,
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

  const getSpecificHelp = (message: string) => {
    if (message.includes('PROBLEMA DE PROPRIEDADE DO DOMÍNIO')) {
      return (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Passos Específicos para Resolver:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Acesse o painel da Hostinger e verifique a lista de domínios</li>
                <li>Confirme se o domínio <code className="bg-blue-100 px-1 rounded">{testDomain}</code> aparece lá</li>
                <li>Se não aparecer, verifique se está em outra conta Hostinger</li>
                <li>Gere um novo token API na conta que possui o domínio</li>
                <li>Teste novamente com o novo token</li>
              </ol>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
          <div className="space-y-3">
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
                  <AlertDescription className="whitespace-pre-line">
                    {debugResult.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
            
            {!debugResult.success && getSpecificHelp(debugResult.message)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainDebugger;
