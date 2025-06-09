
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Copy, 
  Code2,
  Key,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiGuide = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const downloadPostmanCollection = () => {
    const collection = {
      "info": {
        "name": "Webhook API - Sistema de Parceiros",
        "description": "Collection completa para integração com a API de webhooks do sistema",
        "version": "1.0.0"
      },
      "auth": {
        "type": "bearer",
        "bearer": [
          {
            "key": "token",
            "value": "{{auth_token}}",
            "type": "string"
          }
        ]
      },
      "variable": [
        {
          "key": "base_url",
          "value": "https://vaabpicspdbolvutnscp.supabase.co/functions/v1"
        },
        {
          "key": "auth_token",
          "value": "seu_token_aqui"
        }
      ],
      "item": [
        {
          "name": "Enviar Dados de Cliente",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "nome": "João Silva",
                "cnpj": "12.345.678/0001-90",
                "email": "joao@exemplo.com",
                "telefone": "(11) 99999-9999",
                "hash": "abc123def456"
              }, null, 2)
            },
            "url": {
              "raw": "{{base_url}}/receive-partner-data",
              "host": ["{{base_url}}"],
              "path": ["receive-partner-data"]
            },
            "description": "Endpoint para envio de dados de novos clientes pelos parceiros"
          },
          "response": [
            {
              "name": "Sucesso - Cliente Criado",
              "originalRequest": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": JSON.stringify({
                    "nome": "João Silva",
                    "cnpj": "12.345.678/0001-90",
                    "email": "joao@exemplo.com",
                    "telefone": "(11) 99999-9999",
                    "hash": "abc123def456"
                  }, null, 2)
                },
                "url": {
                  "raw": "{{base_url}}/receive-partner-data",
                  "host": ["{{base_url}}"],
                  "path": ["receive-partner-data"]
                }
              },
              "status": "Created",
              "code": 201,
              "body": JSON.stringify({
                "success": true,
                "project_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "Projeto criado com sucesso",
                "partner": "Nome do Parceiro"
              }, null, 2)
            },
            {
              "name": "Erro - Cliente Já Existe",
              "originalRequest": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": JSON.stringify({
                    "nome": "João Silva",
                    "hash": "abc123def456"
                  }, null, 2)
                },
                "url": {
                  "raw": "{{base_url}}/receive-partner-data",
                  "host": ["{{base_url}}"],
                  "path": ["receive-partner-data"]
                }
              },
              "status": "Conflict",
              "code": 409,
              "body": JSON.stringify({
                "error": "Projeto já existe",
                "project_id": "550e8400-e29b-41d4-a716-446655440000",
                "client_name": "João Silva"
              }, null, 2)
            }
          ]
        },
        {
          "name": "Teste de Webhook",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "type": "test",
                "message": "Webhook de teste do sistema",
                "timestamp": "2024-01-15T10:30:00Z"
              }, null, 2)
            },
            "url": {
              "raw": "https://seu-webhook-url.com/webhook",
              "host": ["https://seu-webhook-url.com"],
              "path": ["webhook"]
            },
            "description": "Exemplo de teste de webhook - substitua pela sua URL"
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webhook-api-collection.postman_collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Collection baixada!",
      description: "A collection do Postman foi baixada com sucesso.",
    });
  };

  const curlExample = `# Enviar dados de cliente
curl -X POST "https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '{
    "nome": "João Silva",
    "cnpj": "12.345.678/0001-90",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "hash": "abc123def456"
  }'`;

  const jsExample = `// Exemplo em JavaScript/Node.js
const response = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_AQUI'
  },
  body: JSON.stringify({
    nome: 'João Silva',
    cnpj: '12.345.678/0001-90',
    email: 'joao@exemplo.com',
    telefone: '(11) 99999-9999',
    hash: 'abc123def456'
  })
});

const result = await response.json();
console.log(result);`;

  const phpExample = `<?php
// Exemplo em PHP
$data = [
    'nome' => 'João Silva',
    'cnpj' => '12.345.678/0001-90',
    'email' => 'joao@exemplo.com',
    'telefone' => '(11) 99999-9999',
    'hash' => 'abc123def456'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer SEU_TOKEN_AQUI'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`;

  const pythonExample = `# Exemplo em Python
import requests
import json

url = "https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data"

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer SEU_TOKEN_AQUI"
}

data = {
    "nome": "João Silva",
    "cnpj": "12.345.678/0001-90",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "hash": "abc123def456"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Guia de Implementação Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="authentication">Autenticação</TabsTrigger>
              <TabsTrigger value="examples">Exemplos de Código</TabsTrigger>
              <TabsTrigger value="postman">Postman</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Como Integrar com Nossa API</h3>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Pré-requisitos</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Token de autenticação válido</li>
                        <li>• Hash único do parceiro</li>
                        <li>• URL do endpoint configurada</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">1. Obter Credenciais</h4>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato conosco para receber seu token de autenticação e hash único.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">2. Configurar Webhook</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure sua URL de webhook para receber notificações de status.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">3. Implementar Envio</h4>
                    <p className="text-sm text-muted-foreground">
                      Use nossa API para enviar dados de novos clientes.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">4. Receber Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações automáticas sobre o status dos projetos.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sistema de Autenticação</h3>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Key className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800">Bearer Token</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Todas as requisições devem incluir o header Authorization com seu token.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Header Obrigatório</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">Authorization: Bearer SEU_TOKEN_AQUI</code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyCode('Authorization: Bearer SEU_TOKEN_AQUI')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Códigos de Resposta</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">200</Badge>
                      <span className="text-sm">Sucesso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">201</Badge>
                      <span className="text-sm">Criado com sucesso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">401</Badge>
                      <span className="text-sm">Token inválido ou ausente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">409</Badge>
                      <span className="text-sm">Recurso já existe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">400</Badge>
                      <span className="text-sm">Dados inválidos</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>

                <TabsContent value="curl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Exemplo cURL</h4>
                      <Button variant="outline" size="sm" onClick={() => copyCode(curlExample)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{curlExample}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="javascript">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Exemplo JavaScript/Node.js</h4>
                      <Button variant="outline" size="sm" onClick={() => copyCode(jsExample)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{jsExample}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="php">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Exemplo PHP</h4>
                      <Button variant="outline" size="sm" onClick={() => copyCode(phpExample)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{phpExample}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Exemplo Python</h4>
                      <Button variant="outline" size="sm" onClick={() => copyCode(pythonExample)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{pythonExample}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="postman" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Collection do Postman</h3>
                
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Download className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Collection Completa</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Baixe nossa collection completa com todos os endpoints e exemplos configurados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={downloadPostmanCollection} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Collection do Postman
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium mb-2">Como usar:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Baixe o arquivo da collection</li>
                      <li>Importe no Postman (File → Import)</li>
                      <li>Configure a variável auth_token com seu token</li>
                      <li>Execute os requests de exemplo</li>
                    </ol>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Variáveis da Collection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <code className="text-sm">base_url</code>
                      <span className="text-sm text-muted-foreground">URL base da API</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-sm">auth_token</code>
                      <span className="text-sm text-muted-foreground">Seu token de autenticação</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
