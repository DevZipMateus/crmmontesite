
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Bug, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TroubleshootingGuide = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const debugScriptCode = `// Script de debug para testar integração
const debugWebhookIntegration = async () => {
  console.log('=== DEBUG WEBHOOK INTEGRATION ===');
  
  // 1. Testar criação de projeto
  console.log('1. Testando criação de projeto...');
  try {
    const projectResponse = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN_AQUI'
      },
      body: JSON.stringify({
        nome: 'Teste Debug',
        telefone: '(11) 99999-9999',
        hash: 'debug_' + Date.now(),
        email: 'debug@teste.com'
      })
    });
    
    const projectResult = await projectResponse.json();
    console.log('✅ Projeto criado:', projectResult);
    
    // 2. Testar envio de formulário
    console.log('2. Testando envio de formulário...');
    const formResponse = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-form-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modelo: 'Modelo Debug',
        observacoes: 'Teste de debug do sistema',
        email: 'debug@formulario.com',
        hash: 'debug_' + Date.now()
      })
    });
    
    const formResult = await formResponse.json();
    console.log('✅ Formulário enviado:', formResult);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar teste
debugWebhookIntegration();`;

  const hashValidationCode = `// Validação de hash no frontend
const validateHash = (hash) => {
  console.log('Validando hash:', hash);
  
  // Verificações básicas
  if (!hash) {
    console.error('❌ Hash não fornecida');
    return false;
  }
  
  if (typeof hash !== 'string') {
    console.error('❌ Hash deve ser uma string');
    return false;
  }
  
  if (hash.length < 5) {
    console.error('❌ Hash muito curta (mínimo 5 caracteres)');
    return false;
  }
  
  // Verificar se hash existe no localStorage
  const storedHash = localStorage.getItem('projectHash');
  if (storedHash && storedHash !== hash) {
    console.warn('⚠️ Hash diferente da armazenada:', {
      url: hash,
      stored: storedHash
    });
  }
  
  console.log('✅ Hash válida');
  return true;
};

// Uso
const hash = window.location.pathname.split('/').pop();
if (validateHash(hash)) {
  localStorage.setItem('projectHash', hash);
}`;

  const errorHandlingCode = `// Sistema completo de tratamento de erros
class WebhookError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'WebhookError';
    this.code = code;
    this.details = details;
  }
}

const handleWebhookResponse = async (response, context = '') => {
  console.log(\`Processando resposta \${context}:\`, response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Sucesso:', data);
    return data;
  }
  
  // Tratar erros específicos
  switch (response.status) {
    case 400:
      const badRequestData = await response.json();
      throw new WebhookError(
        'Dados inválidos: ' + (badRequestData.error || 'Verifique os campos obrigatórios'),
        'INVALID_DATA',
        { status: 400, response: badRequestData }
      );
      
    case 401:
      throw new WebhookError(
        'Token de autenticação inválido ou expirado',
        'UNAUTHORIZED',
        { status: 401, hint: 'Verifique se o token está correto e não expirou' }
      );
      
    case 404:
      const notFoundData = await response.json();
      throw new WebhookError(
        'Projeto não encontrado: ' + (notFoundData.error || 'Hash inválida'),
        'PROJECT_NOT_FOUND',
        { status: 404, hint: 'Verifique se a hash corresponde a um projeto existente' }
      );
      
    case 409:
      const conflictData = await response.json();
      throw new WebhookError(
        'Projeto já existe: ' + (conflictData.error || 'Hash duplicada'),
        'DUPLICATE_PROJECT',
        { status: 409, hint: 'Use uma hash diferente ou verifique se o projeto já foi criado' }
      );
      
    case 500:
      throw new WebhookError(
        'Erro interno do servidor',
        'INTERNAL_ERROR',
        { status: 500, hint: 'Tente novamente em alguns minutos' }
      );
      
    default:
      throw new WebhookError(
        \`Erro HTTP \${response.status}\`,
        'HTTP_ERROR',
        { status: response.status }
      );
  }
};`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Guia de Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Guia completo para diagnosticar e resolver problemas comuns na integração com webhooks e formulários.
          </p>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica importante:</strong> Sempre verifique os logs no painel de webhook do sistema antes de fazer alterações no código.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Problemas com Hash */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Problemas com Hash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">🔴 Problemas Comuns</h4>
              <ul className="text-sm space-y-2">
                <li>• Hash não é capturada da URL</li>
                <li>• Hash perdida durante navegação</li>
                <li>• Hash não incluída no formulário</li>
                <li>• Projeto não encontrado (404)</li>
                <li>• Hash duplicada (409)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Soluções</h4>
              <ul className="text-sm space-y-2">
                <li>• Verificar configuração do React Router</li>
                <li>• Implementar persistência no localStorage</li>
                <li>• Usar Context API para estado global</li>
                <li>• Validar hash antes do envio</li>
                <li>• Gerar hashs únicas no sistema parceiro</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Script de Validação de Hash</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(hashValidationCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{hashValidationCode}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problemas de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Erros de Autenticação (401)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Causas Possíveis:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Token ausente no header Authorization</li>
              <li>• Token com formato incorreto (deve ser "Bearer TOKEN")</li>
              <li>• Token expirado ou inválido</li>
              <li>• Espaços extras ou caracteres invisíveis no token</li>
              <li>• Token não configurado no sistema de parceiros</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Como Resolver:</h4>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Verificar se o header está no formato correto: <code>Authorization: Bearer SEU_TOKEN</code></li>
              <li>Confirmar que o token não tem espaços extras</li>
              <li>Verificar na aba "Autenticação" do painel se há tentativas de login falhando</li>
              <li>Solicitar novo token se necessário</li>
              <li>Testar primeiro com cURL antes de implementar no código</li>
            </ol>
          </div>

          <div className="bg-muted p-3 rounded">
            <p className="text-sm"><strong>Teste rápido:</strong></p>
            <code className="text-xs">
              curl -H "Authorization: Bearer SEU_TOKEN" https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Problemas de Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-500" />
            Problemas com Formulários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 p-3 rounded">
              <h4 className="font-semibold text-orange-800 mb-1">Erro 404</h4>
              <p className="text-sm text-orange-700">Projeto não encontrado com a hash fornecida</p>
              <p className="text-xs text-orange-600 mt-1">
                <strong>Solução:</strong> Verificar se o projeto foi criado primeiro via receive-partner-data
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <h4 className="font-semibold text-blue-800 mb-1">Erro 400</h4>
              <p className="text-sm text-blue-700">Dados obrigatórios não fornecidos</p>
              <p className="text-xs text-blue-600 mt-1">
                <strong>Solução:</strong> Verificar se hash e modelo estão preenchidos
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 p-3 rounded">
              <h4 className="font-semibold text-purple-800 mb-1">Dados não aparecem</h4>
              <p className="text-sm text-purple-700">Formulário enviado mas dados não aparecem no card</p>
              <p className="text-xs text-purple-600 mt-1">
                <strong>Solução:</strong> Aguardar alguns segundos ou atualizar a página
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Checklist de Debug para Formulários:</h4>
            <div className="bg-muted p-3 rounded">
              <ul className="text-sm space-y-1">
                <li>□ Hash está sendo capturada corretamente da URL</li>
                <li>□ Hash está persistida no localStorage/sessionStorage</li>
                <li>□ Modelo foi selecionado pelo usuário</li>
                <li>□ Payload inclui hash, modelo e dados opcionais</li>
                <li>□ Endpoint receive-form-data está sendo chamado</li>
                <li>□ Resposta HTTP é 200/201</li>
                <li>□ Projeto original existe no sistema</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script de Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Script de Debug Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use este script para testar toda a integração de uma vez e identificar onde está o problema.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Script de Teste Completo</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(debugScriptCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{debugScriptCode}</code>
              </pre>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como usar:</strong> Cole este script no console do navegador, substitua "SEU_TOKEN_AQUI" pelo seu token real e execute. Verifique os logs para identificar problemas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Sistema de Tratamento de Erros */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Avançado de Tratamento de Erros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Classe de Erro Personalizada</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(errorHandlingCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{errorHandlingCode}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contatos e Suporte */}
      <Card>
        <CardHeader>
          <CardTitle>Quando Buscar Suporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Problemas que você pode resolver:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Erros 400 (dados inválidos)</li>
                <li>• Problemas de captura de hash</li>
                <li>• Formulários não enviando</li>
                <li>• Validação de dados</li>
                <li>• Configuração do frontend</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Quando buscar suporte:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Erros 500 (servidor)</li>
                <li>• Problemas de autenticação persistentes</li>
                <li>• Webhooks não sendo enviados</li>
                <li>• Timeouts constantes</li>
                <li>• Problemas de configuração do sistema</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Informações para incluir no suporte:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Código de erro específico (400, 401, 404, etc.)</li>
              <li>• Hash do projeto que está com problema</li>
              <li>• Timestamp do erro (quando aconteceu)</li>
              <li>• Payload que foi enviado</li>
              <li>• Logs do console do navegador</li>
              <li>• Passos para reproduzir o problema</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
