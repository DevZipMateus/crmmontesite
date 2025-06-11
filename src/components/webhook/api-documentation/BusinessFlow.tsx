
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ArrowRight, CheckCircle, Clock, User, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BusinessFlow = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const partnerIntegrationCode = `// 1. Parceiro envia dados do cliente
const clientData = {
  nome: "João Silva",
  telefone: "(11) 99999-9999", 
  hash: "unique_client_123",
  cnpj: "12.345.678/0001-90",
  email: "joao@exemplo.com"
};

const response = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN'
  },
  body: JSON.stringify(clientData)
});

// Resposta: projeto criado com status "Recebido"
// URL gerada: https://montesite.com.br/unique_client_123`;

  const siteIntegrationCode = `// 2. Site externo captura hash e mantém durante processo
// Exemplo para React Router
import { useParams } from 'react-router-dom';

function FormularioPage() {
  const { hash } = useParams(); // Captura hash da URL /{hash}
  
  // Persiste hash durante navegação
  useEffect(() => {
    if (hash) {
      localStorage.setItem('projectHash', hash);
    }
  }, [hash]);

  // 3. Envia dados do formulário com hash
  const submitForm = async (formData) => {
    const payload = {
      modelo: formData.modelo,
      observacoes: formData.observacoes,
      email: formData.email,
      hash: localStorage.getItem('projectHash') // Hash original
    };

    await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-form-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };
}`;

  const webhookExampleCode = `// 4. Parceiro recebe notificações automáticas
app.post('/webhook', (req, res) => {
  const { type, status, nome, hash } = req.body;
  
  if (type === 'status_change') {
    console.log(\`Cliente \${nome} (hash: \${hash}) mudou para status: \${status}\`);
    
    // Atualizar sistema interno do parceiro
    updateClientStatus(hash, status);
  }
  
  res.status(200).send('OK');
});`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Fluxo Completo do Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Parceiro</h3>
              <p className="text-sm text-muted-foreground">Envia dados do cliente via API</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Cliente</h3>
              <p className="text-sm text-muted-foreground">Acessa URL personalizada e preenche formulário</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">3. Processamento</h3>
              <p className="text-sm text-muted-foreground">Sistema atualiza projeto automaticamente</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">4. Notificação</h3>
              <p className="text-sm text-muted-foreground">Webhooks enviados para parceiro</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapa 1: Integração do Parceiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="bg-blue-500">POST</Badge>
            <div className="flex-1">
              <h4 className="font-semibold">Envio de Dados do Cliente</h4>
              <p className="text-sm text-muted-foreground mb-3">
                O parceiro envia os dados do cliente para criar um novo projeto no sistema.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Exemplo de Implementação</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(partnerIntegrationCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{partnerIntegrationCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <h4 className="font-semibold text-blue-800 mb-1">Resultado desta etapa:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Projeto criado no sistema com status "Recebido"</li>
              <li>• Hash única associada ao projeto</li>
              <li>• URL personalizada gerada: <code>https://montesite.com.br/{"{hash}"}</code></li>
              <li>• Cliente pode ser direcionado para preencher formulário</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapa 2: Configuração do Site Externo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="bg-green-500">Frontend</Badge>
            <div className="flex-1">
              <h4 className="font-semibold">Captura e Persistência da Hash</h4>
              <p className="text-sm text-muted-foreground mb-3">
                O site externo deve capturar a hash da URL e mantê-la durante todo o processo de seleção e preenchimento.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Implementação no Site Externo</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(siteIntegrationCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{siteIntegrationCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <h4 className="font-semibold text-green-800 mb-1">Fluxo no site externo:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Cliente acessa <code>https://montesite.com.br/abc123</code></li>
              <li>• Site captura hash "abc123" da URL</li>
              <li>• Hash é persistida em localStorage ou contexto</li>
              <li>• Cliente navega entre páginas mantendo a hash</li>
              <li>• Ao submeter formulário, hash é incluída no payload</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapa 3: Envio do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="bg-orange-500">POST</Badge>
            <div className="flex-1">
              <h4 className="font-semibold">Dados de Personalização</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Após o cliente escolher o modelo e preencher suas preferências, os dados são enviados para atualizar o projeto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Dados Obrigatórios</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>hash:</strong> Identificador do projeto</li>
                <li>• <strong>modelo:</strong> Modelo escolhido</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dados Opcionais</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>observacoes:</strong> Preferências do cliente</li>
                <li>• <strong>email:</strong> Email complementar</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-3 rounded">
            <h4 className="font-semibold text-orange-800 mb-1">Processamento automático:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Projeto é localizado pela hash</li>
              <li>• Campos do formulário são atualizados</li>
              <li>• Status é marcado como "formulário preenchido"</li>
              <li>• Data de preenchimento é registrada</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapa 4: Notificações Automáticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="bg-purple-500">Webhook</Badge>
            <div className="flex-1">
              <h4 className="font-semibold">Sistema de Notificações</h4>
              <p className="text-sm text-muted-foreground mb-3">
                O sistema envia automaticamente webhooks para o parceiro quando há mudanças no projeto.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Exemplo de Receptor de Webhook</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(webhookExampleCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{webhookExampleCode}</code>
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 p-3 rounded">
              <h4 className="font-semibold text-purple-800 mb-1">Tipos de Webhook:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <strong>status_change:</strong> Mudança no status do projeto</li>
                <li>• <strong>domain_change:</strong> Alteração do domínio</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded">
              <h4 className="font-semibold text-purple-800 mb-1">Eventos Automáticos:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Formulário preenchido</li>
                <li>• Status atualizado manualmente</li>
                <li>• Domínio configurado</li>
                <li>• Projeto concluído</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Benefícios da Integração Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Para o Parceiro</h4>
              <ul className="text-sm space-y-1">
                <li>• Automação completa do processo</li>
                <li>• Notificações em tempo real</li>
                <li>• Integração com sistemas próprios</li>
                <li>• Rastreamento detalhado de projetos</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Para o Cliente</h4>
              <ul className="text-sm space-y-1">
                <li>• Experiência personalizada</li>
                <li>• Processo simplificado</li>
                <li>• URL única e direta</li>
                <li>• Comunicação eficiente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
