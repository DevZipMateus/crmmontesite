
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
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  "status": "Em produção",
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "(11) 99999-9999",
  "cnpj": "12.345.678/0001-90",
  "hash": "abc123def456",
  "data_status": "2024-01-15T10:30:00Z",
  "domain": "joaosilva.com.br"
}`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="receive" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receive">
            <ReceiveIcon className="h-4 w-4 mr-2" />
            Dados que Recebemos
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Dados que Enviamos
          </TabsTrigger>
        </TabsList>

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
                  Recebemos dados de novos clientes através dos nossos parceiros.
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
                    <p className="text-xs text-muted-foreground mt-1">Nome do cliente</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">hash</code>
                    <p className="text-xs text-muted-foreground mt-1">Hash único do parceiro</p>
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
                    <p className="text-xs text-muted-foreground mt-1">CNPJ da empresa</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">email</code>
                    <p className="text-xs text-muted-foreground mt-1">Email de contato</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">telefone</code>
                    <p className="text-xs text-muted-foreground mt-1">Telefone de contato</p>
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
                  Enviamos atualizações de status dos projetos para os parceiros.
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
                    <p className="text-xs text-muted-foreground mt-1">Data da alteração</p>
                  </div>
                  <div className="border rounded p-3">
                    <code className="text-sm font-mono">domain</code>
                    <p className="text-xs text-muted-foreground mt-1">Domínio do site (quando disponível)</p>
                  </div>
                </div>
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
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Guias de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">Documentação API</span>
              <span className="text-xs text-muted-foreground">Guia completo da API</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Download className="h-8 w-8 mb-2" />
              <span className="font-medium">Postman Collection</span>
              <span className="text-xs text-muted-foreground">Baixar coleção para testes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
