
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ErrorHandling = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const errorHandlingExample = `// Exemplo completo de tratamento de erros
async function sendClientData(clientData) {
  try {
    const response = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + YOUR_TOKEN
      },
      body: JSON.stringify(clientData)
    });

    const result = await response.json();

    switch (response.status) {
      case 201:
        console.log('✅ Cliente criado com sucesso:', result);
        return result;
        
      case 409:
        console.log('⚠️ Cliente já existe:', result);
        // Decidir se atualiza ou ignora
        return result;
        
      case 401:
        console.error('🔒 Token inválido ou expirado');
        // Renovar token ou notificar usuário
        throw new Error('Token inválido');
        
      case 400:
        console.error('❌ Dados inválidos:', result.error);
        // Validar dados antes de reenviar
        throw new Error('Dados inválidos: ' + result.error);
        
      default:
        console.error('🚨 Erro inesperado:', response.status, result);
        throw new Error('Erro na API: ' + response.status);
    }
  } catch (error) {
    console.error('💥 Erro de conexão:', error);
    // Implementar retry ou fallback
    throw error;
  }
}`;

  const retryExample = `// Implementação com retry automático
async function sendWithRetry(clientData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendClientData(clientData);
      return result;
    } catch (error) {
      console.log(\`Tentativa \${attempt} falhou:\`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(\`Falha após \${maxRetries} tentativas: \${error.message}\`);
      }
      
      // Aguardar antes da próxima tentativa (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Tratamento de Erros e Códigos de Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Codes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Códigos de Status HTTP</h3>
            
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default">201 Created</Badge>
                </div>
                <h4 className="font-semibold">Cliente criado com sucesso</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  O cliente foi cadastrado no sistema e um novo projeto foi iniciado.
                </p>
                <div className="bg-muted p-3 rounded mt-2">
                  <code className="text-sm">
                    {JSON.stringify({
                      success: true,
                      project_id: "uuid-do-projeto",
                      message: "Projeto criado com sucesso",
                      partner: "Nome do Parceiro"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">409 Conflict</Badge>
                </div>
                <h4 className="font-semibold">Cliente já existe</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Já existe um projeto com o hash fornecido. Verifique se não é uma duplicação.
                </p>
                <div className="bg-muted p-3 rounded mt-2">
                  <code className="text-sm">
                    {JSON.stringify({
                      error: "Projeto já existe",
                      project_id: "uuid-do-projeto-existente",
                      client_name: "Nome do Cliente"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">401 Unauthorized</Badge>
                </div>
                <h4 className="font-semibold">Token inválido ou ausente</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  O token de autenticação não foi fornecido ou é inválido/expirado.
                </p>
                <div className="bg-muted p-3 rounded mt-2">
                  <code className="text-sm">
                    {JSON.stringify({
                      error: "Token de autenticação obrigatório"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">400 Bad Request</Badge>
                </div>
                <h4 className="font-semibold">Dados inválidos</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Os campos obrigatórios não foram fornecidos ou estão em formato inválido.
                </p>
                <div className="bg-muted p-3 rounded mt-2">
                  <code className="text-sm">
                    {JSON.stringify({
                      error: "Nome e hash são obrigatórios"
                    }, null, 2)}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Error Handling Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exemplo de Tratamento de Erros</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Implementação Completa</h4>
                <Button variant="outline" size="sm" onClick={() => copyCode(errorHandlingExample)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{errorHandlingExample}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Retry Logic */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sistema de Retry</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Retry com Backoff Exponencial</h4>
                <Button variant="outline" size="sm" onClick={() => copyCode(retryExample)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{retryExample}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Boas Práticas</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sempre validar dados antes do envio</li>
              <li>• Implementar logs detalhados para debugging</li>
              <li>• Usar sistema de retry para falhas temporárias</li>
              <li>• Monitorar tokens e renovar antes do vencimento</li>
              <li>• Tratar cada código de status adequadamente</li>
              <li>• Implementar fallbacks para casos críticos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
