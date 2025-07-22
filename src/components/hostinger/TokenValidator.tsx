
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
      const result = await hostingerDNSService.validateToken(apiToken.trim());
      setValidationResult(result);
      onValidationResult(result);
    } catch (error) {
      const result = { 
        valid: false, 
        message: `Erro ao validar token: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
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
          <Alert className={validationResult.valid ? 'border-green-200' : 'border-red-200'}>
            <div className="flex items-start gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={validationResult.valid ? "default" : "destructive"}>
                    {validationResult.valid ? 'Válido' : 'Inválido'}
                  </Badge>
                </div>
                <AlertDescription>
                  {validationResult.message}
                </AlertDescription>
                {!validationResult.valid && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium mb-1">Passos para resolver:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Verifique se o token foi copiado corretamente</li>
                      <li>Confirme se o token não expirou</li>
                      <li>Gere um novo token no painel da Hostinger</li>
                      <li>Verifique se você tem permissões de administrador</li>
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

export default TokenValidator;
