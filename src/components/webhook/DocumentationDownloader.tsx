
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DocumentationDownloader = () => {
  const { toast } = useToast();

  const downloadDocumentation = () => {
    const documentationHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentação da API de Webhooks - Sistema de Parceiros</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3 { color: #2563eb; }
        h1 { border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; }
        .section { margin-bottom: 40px; }
        .code-block {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
        }
        pre { margin: 0; }
        code {
            background: #f1f5f9;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .endpoint {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
        }
        .status-code {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin: 4px 0;
        }
        .status-200 { background: #dcfce7; color: #166534; }
        .status-201 { background: #dcfce7; color: #166534; }
        .status-400 { background: #fecaca; color: #dc2626; }
        .status-401 { background: #fecaca; color: #dc2626; }
        .status-409 { background: #fef3c7; color: #d97706; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        th { background: #f9fafb; font-weight: 600; }
        .toc {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .toc ul { margin: 0; padding-left: 20px; }
        .toc a { text-decoration: none; color: #2563eb; }
        .toc a:hover { text-decoration: underline; }
        .highlight-box {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
        }
        .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <h1>📚 Documentação da API de Webhooks - Sistema de Parceiros</h1>
    
    <div class="toc">
        <h3>📋 Índice</h3>
        <ul>
            <li><a href="#overview">1. Visão Geral</a></li>
            <li><a href="#authentication">2. Autenticação</a></li>
            <li><a href="#endpoints">3. Endpoints</a></li>
            <li><a href="#receive-data">4. Dados Recebidos</a></li>
            <li><a href="#send-data">5. Dados Enviados</a></li>
            <li><a href="#status-codes">6. Códigos de Status</a></li>
            <li><a href="#error-handling">7. Tratamento de Erros</a></li>
            <li><a href="#examples">8. Exemplos de Implementação</a></li>
            <li><a href="#postman">9. Collection do Postman</a></li>
            <li><a href="#best-practices">10. Boas Práticas</a></li>
        </ul>
    </div>

    <div id="overview" class="section">
        <h2>🔄 1. Visão Geral</h2>
        <p>Nossa API de webhooks permite integração bidirecional entre parceiros e o sistema principal:</p>
        <ul>
            <li><strong>📤 Envio de Dados:</strong> Parceiros enviam dados de novos clientes</li>
            <li><strong>📥 Recebimento de Updates:</strong> Sistema envia atualizações de status dos projetos</li>
            <li><strong>🔐 Segurança:</strong> Autenticação via Bearer Token customizado</li>
            <li><strong>📊 Logs:</strong> Rastreamento completo de todas as interações</li>
        </ul>

        <div class="endpoint">
            <strong>🌐 URL Base da API:</strong><br>
            <code>https://vaabpicspdbolvutnscp.supabase.co/functions/v1</code>
        </div>

        <div class="warning-box">
            <strong>⚠️ Configuração Especial:</strong> Esta função está configurada com <code>verify_jwt = false</code> 
            no arquivo <code>supabase/config.toml</code> para permitir autenticação via Bearer Token customizado 
            ao invés do JWT padrão do Supabase.
        </div>
    </div>

    <div id="authentication" class="section">
        <h2>🔐 2. Autenticação</h2>
        <p>Todas as requisições devem incluir o header de autorização com seu token específico:</p>
        <div class="code-block">
            <pre><code>Authorization: Bearer tok_exemplo123456789</code></pre>
        </div>
        
        <div class="warning-box">
            <strong>⚠️ Importante:</strong> 
            <ul>
                <li>Cada parceiro possui um token único e específico</li>
                <li>Os tokens são validados contra a tabela de parceiros no banco de dados</li>
                <li>Tokens podem ter data de expiração configurada</li>
                <li>Todas as tentativas de autenticação são logadas na tabela auth_logs</li>
            </ul>
        </div>
    </div>

    <div id="endpoints" class="section">
        <h2>🎯 3. Endpoints</h2>
        
        <h3>📤 Envio de Dados de Clientes</h3>
        <div class="endpoint">
            <strong>POST</strong> <code>/receive-partner-data</code><br>
            <small>Endpoint para parceiros enviarem dados de novos clientes</small>
        </div>
    </div>

    <div id="receive-data" class="section">
        <h2>📥 4. Estrutura de Dados Recebidos</h2>
        
        <h3>Campos Obrigatórios</h3>
        <table>
            <tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr>
            <tr><td><code>nome</code></td><td>string</td><td>Nome do cliente</td></tr>
            <tr><td><code>hash</code></td><td>string</td><td>Hash único do parceiro</td></tr>
        </table>

        <h3>Campos Opcionais</h3>
        <table>
            <tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr>
            <tr><td><code>cnpj</code></td><td>string</td><td>CNPJ da empresa</td></tr>
            <tr><td><code>email</code></td><td>string</td><td>Email de contato</td></tr>
            <tr><td><code>telefone</code></td><td>string</td><td>Telefone de contato</td></tr>
        </table>

        <h3>Exemplo de Payload</h3>
        <div class="code-block">
            <pre><code>{
  "nome": "João Silva",
  "cnpj": "12.345.678/0001-90",
  "email": "joao@exemplo.com",
  "telefone": "(11) 99999-9999",
  "hash": "abc123def456"
}</code></pre>
        </div>

        <div class="warning-box">
            <strong>⚠️ Hash Único:</strong> O campo <code>hash</code> deve ser único por projeto. 
            Se já existir um projeto com o mesmo hash, a API retornará erro 409 (Conflict).
        </div>
    </div>

    <div id="send-data" class="section">
        <h2>📤 5. Estrutura de Dados Enviados</h2>
        <p>Enviamos notificações de status para os parceiros quando há atualizações nos projetos:</p>

        <h3>Campos Enviados</h3>
        <table>
            <tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr>
            <tr><td><code>status</code></td><td>string</td><td>Status atual do projeto</td></tr>
            <tr><td><code>nome</code></td><td>string</td><td>Nome do cliente</td></tr>
            <tr><td><code>email</code></td><td>string</td><td>Email do cliente (placeholder atual)</td></tr>
            <tr><td><code>telefone</code></td><td>string</td><td>Telefone do cliente (placeholder atual)</td></tr>
            <tr><td><code>cnpj</code></td><td>string</td><td>CNPJ do cliente</td></tr>
            <tr><td><code>hash</code></td><td>string</td><td>Hash único do parceiro</td></tr>
            <tr><td><code>data_status</code></td><td>string (ISO)</td><td>Data da alteração</td></tr>
            <tr><td><code>domain</code></td><td>string</td><td>Domínio do site (quando disponível)</td></tr>
        </table>

        <h3>Status Possíveis</h3>
        <ul>
            <li>Recebido (status inicial quando projeto é criado)</li>
            <li>Em análise</li>
            <li>Em desenvolvimento</li>
            <li>Em teste</li>
            <li>Em produção</li>
            <li>Finalizado</li>
        </ul>

        <h3>Exemplo de Notificação</h3>
        <div class="code-block">
            <pre><code>{
  "status": "Recebido",
  "nome": "João Silva",
  "email": "placeholder@email.com",
  "telefone": "placeholder",
  "cnpj": "12.345.678/0001-90",
  "hash": "abc123def456",
  "data_status": "2024-01-15T10:30:00Z",
  "domain": null
}</code></pre>
        </div>

        <div class="warning-box">
            <strong>📝 Nota sobre Placeholders:</strong> Atualmente os campos <code>email</code> e <code>telefone</code> 
            são enviados como placeholders pois estes dados não estão sendo armazenados na tabela de projetos.
        </div>
    </div>

    <div id="status-codes" class="section">
        <h2>📊 6. Códigos de Status HTTP</h2>
        
        <div class="status-code status-201">201 Created</div>
        <p><strong>Cliente criado com sucesso</strong> - O cliente foi cadastrado e um novo projeto foi iniciado com status "Recebido".</p>
        <div class="code-block">
            <pre><code>{
  "success": true,
  "project_id": "uuid-do-projeto",
  "message": "Projeto criado com sucesso",
  "partner": "Nome do Parceiro"
}</code></pre>
        </div>

        <div class="status-code status-409">409 Conflict</div>
        <p><strong>Cliente já existe</strong> - Já existe um projeto com o hash fornecido.</p>
        <div class="code-block">
            <pre><code>{
  "error": "Projeto já existe",
  "project_id": "uuid-do-projeto-existente",
  "client_name": "Nome do Cliente"
}</code></pre>
        </div>

        <div class="status-code status-401">401 Unauthorized</div>
        <p><strong>Token inválido ou ausente</strong> - O token de autenticação não foi fornecido ou é inválido.</p>
        <div class="code-block">
            <pre><code>{
  "error": "Token de autenticação obrigatório"
}</code></pre>
        </div>

        <div class="status-code status-400">400 Bad Request</div>
        <p><strong>Dados inválidos</strong> - Os campos obrigatórios não foram fornecidos ou estão inválidos.</p>
        <div class="code-block">
            <pre><code>{
  "error": "Nome e hash são obrigatórios"
}</code></pre>
        </div>
    </div>

    <div id="error-handling" class="section">
        <h2>🚨 7. Tratamento de Erros</h2>
        
        <h3>Exemplo Completo de Tratamento</h3>
        <div class="code-block">
            <pre><code>async function sendClientData(clientData) {
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
        return result;
        
      case 401:
        console.error('🔒 Token inválido ou expirado');
        throw new Error('Token inválido');
        
      case 400:
        console.error('❌ Dados inválidos:', result.error);
        throw new Error('Dados inválidos: ' + result.error);
        
      default:
        console.error('🚨 Erro inesperado:', response.status, result);
        throw new Error('Erro na API: ' + response.status);
    }
  } catch (error) {
    console.error('💥 Erro de conexão:', error);
    throw error;
  }
}</code></pre>
        </div>

        <h3>Sistema de Retry</h3>
        <div class="code-block">
            <pre><code>async function sendWithRetry(clientData, maxRetries = 3) {
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
}</code></pre>
        </div>
    </div>

    <div id="examples" class="section">
        <h2>💻 8. Exemplos de Implementação</h2>
        
        <h3>cURL</h3>
        <div class="code-block">
            <pre><code># Enviar dados de cliente
curl -X POST "https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tok_exemplo123456789" \\
  -d '{
    "nome": "João Silva",
    "cnpj": "12.345.678/0001-90",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "hash": "abc123def456"
  }'</code></pre>
        </div>

        <h3>JavaScript/Node.js</h3>
        <div class="code-block">
            <pre><code>const response = await fetch('https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer tok_exemplo123456789'
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
console.log(result);</code></pre>
        </div>

        <h3>PHP</h3>
        <div class="code-block">
            <pre><code><?php
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
    'Authorization: Bearer tok_exemplo123456789'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?></code></pre>
        </div>

        <h3>Python</h3>
        <div class="code-block">
            <pre><code>import requests
import json

url = "https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data"

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer tok_exemplo123456789"
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
print(result)</code></pre>
        </div>
    </div>

    <div id="postman" class="section">
        <h2>📮 9. Collection do Postman</h2>
        <p>Para facilitar os testes, fornecemos uma collection completa do Postman com:</p>
        <ul>
            <li>✅ Todos os endpoints configurados</li>
            <li>✅ Variáveis para token e URL base</li>
            <li>✅ Exemplos de requests e responses</li>
            <li>✅ Documentação integrada</li>
        </ul>

        <div class="highlight-box">
            <p><strong>📥 Como usar:</strong></p>
            <ol>
                <li>Baixe o arquivo da collection do sistema</li>
                <li>Importe no Postman (File → Import)</li>
                <li>Configure a variável <code>auth_token</code> com seu token</li>
                <li>Execute os requests de exemplo</li>
            </ol>
        </div>
    </div>

    <div id="best-practices" class="section">
        <h2>✅ 10. Boas Práticas</h2>
        <ul>
            <li>🔍 <strong>Validação:</strong> Sempre validar dados antes do envio</li>
            <li>📝 <strong>Logs:</strong> Implementar logs detalhados para debugging</li>
            <li>🔄 <strong>Retry:</strong> Usar sistema de retry para falhas temporárias</li>
            <li>🔐 <strong>Tokens:</strong> Monitorar tokens e renovar antes do vencimento</li>
            <li>📊 <strong>Status:</strong> Tratar cada código de status adequadamente</li>
            <li>🛡️ <strong>Fallbacks:</strong> Implementar fallbacks para casos críticos</li>
            <li>⚡ <strong>Performance:</strong> Usar requests assíncronos quando possível</li>
            <li>🔒 <strong>Segurança:</strong> Nunca expor tokens em logs ou URLs</li>
            <li>📋 <strong>Hash Único:</strong> Garantir que cada hash seja único por projeto</li>
            <li>🔍 <strong>Monitoramento:</strong> Verificar logs de autenticação e webhook regularmente</li>
        </ul>
    </div>

    <div class="footer">
        <p>📚 <strong>Documentação da API de Webhooks</strong><br>
        Sistema de Parceiros - Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><small>Para suporte técnico, entre em contato com nossa equipe de desenvolvimento.</small></p>
        <p><small>⚠️ Lembre-se: Esta API usa autenticação customizada via Bearer Token, não JWT padrão do Supabase.</small></p>
    </div>
</body>
</html>`;

    const blob = new Blob([documentationHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentacao-api-webhooks-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Documentação baixada!",
      description: "A documentação completa foi baixada como arquivo HTML.",
    });
  };

  return (
    <Button onClick={downloadDocumentation} variant="outline" className="w-full">
      <FileText className="h-4 w-4 mr-2" />
      Baixar Documentação Completa (HTML)
    </Button>
  );
};
