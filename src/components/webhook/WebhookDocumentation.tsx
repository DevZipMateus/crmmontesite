
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Send, 
  Download as ReceiveIcon, 
  Code2, 
  FileText,
  Copy,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiGuide } from "./api-documentation/ApiGuide";
import { ErrorHandling } from "./api-documentation/ErrorHandling";
import { DocumentationDownloader } from "./DocumentationDownloader";

export const WebhookDocumentation = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const receiveExample = `{
  "nome": "João Silva",
  "cnpj": "12.345.678/0001-90",
  "email": "joao@exemplo.com",
  "telefone": "(11) 99999-9999",
  "hash": "abc123def456"
}`;

  const sendExample = `{
  "status": "Recebido",
  "nome": "João Silva",
  "email": "placeholder@email.com",
  "telefone": "placeholder",
  "cnpj": "12.345.678/0001-90",
  "hash": "abc123def456",
  "data_status": "2024-01-15T10:30:00Z",
  "domain": null
}`;

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800">📚 Documentação Completa</h3>
            <p className="text-sm text-blue-700 mt-1">
              Baixe toda a documentação em um arquivo HTML completo para consulta offline.
            </p>
          </div>
          <DocumentationDownloader />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <ReceiveIcon className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="receive">
            <ReceiveIcon className="h-4 w-4 mr-2" />
            Dados Recebidos
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Dados Enviados
          </TabsTrigger>
          <TabsTrigger value="implementation">
            <Code2 className="h-4 w-4 mr-2" />
            Implementação
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Tratamento de Erros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentação da API de Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔄 Fluxo Bidirecional</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa API permite tanto o envio de dados de clientes quanto o recebimento de atualizações de status.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔐 Autenticação Segura</h3>
                  <p className="text-sm text-muted-foreground">
                    Todas as comunicações são protegidas por tokens Bearer e validação de parceiros.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📊 Logs Completos</h3>
                  <p className="text-sm text-muted-foreground">
                    Mantenha rastro de todas as interações com logs detalhados de autenticação e webhooks.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">⚡ Tempo Real</h3>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações instantâneas sobre mudanças de status dos projetos.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">URLs da API</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">POST</Badge>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data
                    </code>
                  </div>
                  <p className="text-xs text-blue-700">
                    Endpoint para parceiros enviarem dados de novos clientes
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Configuração Importante</h4>
                <p className="text-sm text-yellow-700">
                  Esta função está configurada com <code>verify_jwt = false</code> no arquivo <code>supabase/config.toml</code> 
                  para permitir autenticação via Bearer Token customizado ao invés do JWT padrão do Supabase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiveIcon className="h-5 w-5" />
                Estrutura de Dados Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Endpoint para Parceiros</h4>
                <p className="text-sm text-muted-foreground">
                  Recebemos dados de novos clientes através dos nossos parceiros. O projeto é criado automaticamente com status "Recebido".
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Campos Obrigatórios</h5>
                  <Badge variant="destructive">Obrigatório</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">nome</code>
                    <p className="text-xs text-muted-foreground mt-1">Nome do cliente (string)</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">hash</code>
                    <p className="text-xs text-muted-foreground mt-1">Hash único do parceiro (string)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Campos Opcionais</h5>
                  <Badge variant="outline">Opcional</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">cnpj</code>
                    <p className="text-xs text-muted-foreground mt-1">CNPJ da empresa (string)</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">email</code>
                    <p className="text-xs text-muted-foreground mt-1">Email de contato (string)</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">telefone</code>
                    <p className="text-xs text-muted-foreground mt-1">Telefone de contato (string)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Exemplo de Payload</h5>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode(receiveExample)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{receiveExample}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h5 className="font-semibold text-amber-800 mb-2">⚠️ Importante - Hash Único</h5>
                <p className="text-sm text-amber-700">
                  O campo <code>hash</code> deve ser único por parceiro. Se já existir um projeto com o mesmo hash, 
                  a API retornará erro 409 (Conflict) com os dados do projeto existente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Estrutura de Dados Enviados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Notificações de Status</h4>
                <p className="text-sm text-muted-foreground">
                  Enviamos atualizações de status dos projetos para os parceiros quando há mudanças.
                  As notificações são enviadas automaticamente via trigger no banco de dados.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium">Campos Enviados</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">status</code>
                    <p className="text-xs text-muted-foreground mt-1">Status atual do projeto</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">nome</code>
                    <p className="text-xs text-muted-foreground mt-1">Nome do cliente</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">data_status</code>
                    <p className="text-xs text-muted-foreground mt-1">Data da alteração (ISO 8601)</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">hash</code>
                    <p className="text-xs text-muted-foreground mt-1">Hash único do parceiro</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">cnpj</code>
                    <p className="text-xs text-muted-foreground mt-1">CNPJ do cliente (quando disponível)</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">domain</code>
                    <p className="text-xs text-muted-foreground mt-1">Domínio do site (quando disponível)</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-2">📝 Nota sobre Email e Telefone</h5>
                <p className="text-sm text-yellow-700">
                  Atualmente os campos <code>email</code> e <code>telefone</code> são enviados como placeholders 
                  (<code>"placeholder@email.com"</code> e <code>"placeholder"</code>) pois estes dados não estão 
                  sendo armazenados na tabela de projetos no momento.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Exemplo de Payload</h5>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode(sendExample)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{sendExample}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">Status Possíveis</h5>
                <p className="text-sm text-blue-700 mb-3">
                  Os status seguem a constraint definida no banco de dados:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Badge variant="outline">Recebido</Badge>
                  <Badge variant="outline">Em análise</Badge>
                  <Badge variant="outline">Em desenvolvimento</Badge>
                  <Badge variant="outline">Em teste</Badge>
                  <Badge variant="outline">Em produção</Badge>
                  <Badge variant="outline">Finalizado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <ApiGuide />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ErrorHandling />
        </TabsContent>
      </Tabs>
    </div>
  );
};
