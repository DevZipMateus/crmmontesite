
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, Info, ExternalLink } from 'lucide-react';
import { hostingerDNSService } from '@/services/hostingerDNSService';

interface TokenValidatorProps {
  apiToken: string;
  onValidationResult: (result: { valid: boolean; message: string }) => void;
}

const TokenValidator: React.FC<TokenValidatorProps> = ({ apiToken, onValidationResult }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

  const handleValidateToken = async () => {
    if (!apiToken.trim()) {
      const result = { valid: false, message: 'Token API é obrigatório' };
      setValidationResult(result);
      onValidationResult(result);
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await hostingerDNSService.validateToken(apiToken);
      setValidationResult(result);
      onValidationResult(result);
    } catch (error) {
      const result = { 
        valid: false, 
        message: 'Erro ao validar token: ' + (error instanceof Error ? error.message : String(error))
      };
      setValidationResult(result);
      onValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Validação do Token API
        </CardTitle>
        <CardDescription>
          Verifique se seu token API está válido e tem as permissões necessárias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Tokens API da Hostinger</AlertTitle>
          <AlertDescription>
            Os tokens de API da Hostinger podem ser criados no painel de controle da Hostinger. 
            Para acessar a API de DNS, seu token precisa ter permissões para gerenciar registros DNS.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={handleValidateToken} 
          disabled={isValidating || !apiToken.trim()}
          className="w-full"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            'Validar Token'
          )}
        </Button>

        {validationResult && (
          <Alert className={validationResult.valid ? 'border-green-200' : 'border-amber-200'}>
            <div className="flex items-start gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={validationResult.valid ? "success" : "outline"}>
                    {validationResult.valid ? 'Válido' : 'Problema Detectado'}
                  </Badge>
                </div>
                <AlertDescription>
                  {validationResult.message}
                </AlertDescription>
                {!validationResult.valid && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium mb-1">Sugestões:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Verifique se o token foi digitado corretamente</li>
                      <li>Confirme se o token tem permissões para gerenciar DNS</li>
                      <li>Gere um novo token no painel da Hostinger</li>
                      <li>Contate o suporte da Hostinger para verificar os requisitos de acesso à API</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100 mt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Sobre a API de DNS da Hostinger</h4>
              <p className="text-sm text-blue-700">
                A API de DNS da Hostinger permite gerenciar registros DNS programaticamente. 
                Para usar esta API, é necessário um token com permissões adequadas, que pode 
                estar disponível apenas para contas empresariais ou planos específicos.
              </p>
              <div className="mt-2 flex gap-3">
                <a 
                  href="https://developers.hostinger.com/api/dns/v1/zones" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-sm font-medium"
                >
                  Documentação API <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href="https://www.hostinger.com/cpanel-login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-sm font-medium"
                >
                  Acessar hPanel <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenValidator;
