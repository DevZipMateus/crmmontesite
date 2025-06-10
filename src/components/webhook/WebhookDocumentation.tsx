
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentationDownloader } from "./DocumentationDownloader";

export const WebhookDocumentation = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  const baseUrl = "https://vaabpicspdbolvutnscp.supabase.co/functions/v1";

  const statusChangeExample = `{
  "type": "status_change",
  "status": "Concluído",
  "previous_status": "Em produção",
  "nome": "Cliente Exemplo",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 99999-9999",
  "cnpj": "12.345.678/0001-90",
  "hash": "unique_client_hash",
  "data_status": "2024-01-15T10:30:00Z",
  "domain": "clienteexemplo.com.br"
}`;

  const domainChangeExample = `{
  "type": "domain_change",
  "domain": "novocliente.com.br",
  "previous_domain": "clienteantigo.com.br",
  "nome": "Cliente Exemplo",
  "telefone": "(11) 99999-9999",
  "cnpj": "12.345.678/0001-90",
  "hash": "unique_client_hash",
  "data_domain": "2024-01-15T14:20:00Z",
  "status": "Em produção"
}`;

  const sendDataExample = `curl -X POST ${baseUrl}/receive-partner-data \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '{
    "nome": "Cliente Teste",
    "telefone": "(11) 99999-9999",
    "hash": "unique_test_123",
    "cnpj": "12.345.678/0001-90"
  }'`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentação da API</h2>
          <p className="text-muted-foreground">
            Guia completo para integração com nossos webhooks
          </p>
        </div>
        <DocumentationDownloader />
      </div>

      {/* Endpoints Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">POST</Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {baseUrl}/receive-partner-data
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`${baseUrl}/receive-partner-data`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Endpoint para envio de dados de novos projetos de parceiros
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enviando Dados */}
      <Card>
        <CardHeader>
          <CardTitle>1. Enviando Dados de Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use este endpoint para criar novos projetos através do sistema de parceiros.
          </p>
          
          <div>
            <h4 className="font-medium mb-2">Headers Obrigatórios:</h4>
            <div className="bg-muted p-3 rounded text-sm space-y-1">
              <div><strong>Content-Type:</strong> application/json</div>
              <div><strong>Authorization:</strong> Bearer SEU_TOKEN</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Campos Obrigatórios:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>nome:</strong> Nome do cliente</li>
              <li>• <strong>telefone:</strong> Telefone de contato (obrigatório)</li>
              <li>• <strong>hash:</strong> Identificador único do projeto</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Campos Opcionais:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>cnpj:</strong> CNPJ da empresa</li>
              <li>• <strong>email:</strong> Email de contato</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Requisição:</h4>
            <div className="relative">
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                <code>{sendDataExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(sendDataExample)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recebendo Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>2. Recebendo Webhooks de Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quando o status de um projeto muda, enviamos automaticamente um webhook para sua URL configurada.
          </p>

          <div>
            <h4 className="font-medium mb-2">Webhook de Mudança de Status:</h4>
            <div className="relative">
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                <code>{statusChangeExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(statusChangeExample)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Webhook de Mudança de Domínio:</h4>
            <div className="relative">
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                <code>{domainChangeExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(domainChangeExample)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Codes */}
      <Card>
        <CardHeader>
          <CardTitle>3. Códigos de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">201</Badge>
              <span className="text-sm">Projeto criado com sucesso</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">400</Badge>
              <span className="text-sm">Dados obrigatórios não fornecidos</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">401</Badge>
              <span className="text-sm">Token de autenticação inválido</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-700">409</Badge>
              <span className="text-sm">Projeto já existe (hash duplicado)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">500</Badge>
              <span className="text-sm">Erro interno do servidor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>4. Configurando seu Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para receber webhooks, configure uma URL em seu sistema que aceite requisições POST.
          </p>

          <div>
            <h4 className="font-medium mb-2">Requisitos do seu endpoint:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Aceitar requisições POST</li>
              <li>• Processar JSON no body da requisição</li>
              <li>• Retornar status HTTP 200 para confirmar recebimento</li>
              <li>• Implementar timeout adequado (recomendado: 30 segundos)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Use ferramentas como webhook.site para testar o recebimento de webhooks durante o desenvolvimento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
