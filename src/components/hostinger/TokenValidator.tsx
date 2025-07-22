
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, Info, ExternalLink } from 'lucide-react';

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
    
    // Simulate validation (since the API is not available)
    setTimeout(() => {
      const result = { 
        valid: false, 
        message: 'A API de DNS da Hostinger não está disponível publicamente. O token fornecido pode ser para outra API da Hostinger.'
      };
      setValidationResult(result);
      onValidationResult(result);
      setIsValidating(false);
    }, 1000);
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
          <AlertTitle>API Indisponível</AlertTitle>
          <AlertDescription>
            Nossa investigação indica que a API de DNS da Hostinger não está disponível publicamente.
            O token que você possui pode ser para outro serviço da Hostinger, como VPS ou Hospedagem.
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
            'Tentar Validar Token'
          )}
        </Button>

        {validationResult && (
          <Alert className="border-amber-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    Indisponível
                  </Badge>
                </div>
                <AlertDescription>
                  {validationResult.message}
                </AlertDescription>
                <div className="mt-3 text-sm">
                  <p className="font-medium mb-1">Opções disponíveis:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Utilize o painel de controle da Hostinger para gerenciamento manual</li>
                    <li>Contate o suporte da Hostinger para verificar se existe uma API pública de DNS</li>
                    <li>Considere migrar para um provedor DNS com API pública (Cloudflare, Route53, etc)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Alert>
        )}
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100 mt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Sobre o token API da Hostinger</h4>
              <p className="text-sm text-blue-700">
                A Hostinger oferece diferentes APIs para seus serviços, como hospedagem, VPS e domínios.
                O token que você possui pode ser válido para outros serviços da Hostinger, mas nossa investigação
                indica que a API específica para gerenciamento de DNS não está publicamente disponível.
              </p>
              <div className="mt-2">
                <a 
                  href="https://www.hostinger.com/cpanel-login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-sm font-medium"
                >
                  Acessar Painel da Hostinger <ExternalLink className="h-3 w-3" />
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
