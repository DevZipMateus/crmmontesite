
# Guia de Implantação na Hostinger

Este guia irá ajudá-lo a implantar o aplicativo CRM MonteSite no seu servidor Hostinger.

## Requisitos

- Uma conta na Hostinger com um plano de hospedagem que suporte PHP/MySQL
- Acesso ao painel de controle da Hostinger
- Um domínio configurado (ou subdomínio)
- Node.js e npm instalados em sua máquina local para construir o projeto

## Passos para Implantação

### 1. Prepare o projeto para produção

```bash
# Clone o repositório (se ainda não o fez)
git clone [URL_DO_REPOSITÓRIO]
cd [NOME_DA_PASTA]

# Instale as dependências
npm install

# Crie uma build de produção
npm run build
```

### 2. Configure o servidor na Hostinger

1. Acesse o painel de controle da Hostinger
2. Navegue até a seção de hospedagem e selecione o seu domínio
3. No painel de controle, acesse o Gerenciador de Arquivos ou use o FTP

### 3. Faça upload dos arquivos

1. Navegue até a pasta `public_html` (ou o diretório raiz do seu site)
2. Remova todos os arquivos existentes se estiver substituindo um site antigo
3. Faça upload de todo o conteúdo da pasta `dist` ou `build` gerada após o `npm run build`
4. Certifique-se de que o arquivo `.htaccess` foi enviado (é crucial para o roteamento)

### 4. Verifique se o arquivo .htaccess está correto

O arquivo `.htaccess` deve conter:

```
# Enable URL rewriting
RewriteEngine On

# If the request is not for an existing file or directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rewrite all requests to index.html
RewriteRule ^ index.html [QSA,L]
```

### 5. Verifique a configuração do Supabase

Certifique-se de que as credenciais do Supabase estão configuradas corretamente para o ambiente de produção no arquivo:

```
src/integrations/supabase/client.ts
```

### 6. Teste os links públicos

Após a implantação, teste os links públicos do formulário:

- Formulário público: `https://seu-dominio.com/formulario/modelo1`
- Página de confirmação: `https://seu-dominio.com/confirmacao`

### Solução de Problemas

Se encontrar problemas com o roteamento (erro 404 ao acessar diretamente uma URL):

1. Verifique se o arquivo `.htaccess` foi carregado corretamente
2. Certifique-se de que o mod_rewrite está habilitado no seu servidor Apache
3. Entre em contato com o suporte da Hostinger se precisar ativar o mod_rewrite

Se encontrar problemas com a conexão com o Supabase:

1. Verifique se o URL e a chave anônima do Supabase estão corretos
2. Verifique se o CORS está configurado corretamente no seu projeto Supabase para permitir seu domínio

## Observações

- Sempre faça backup do seu site antes de atualizar
- Considere usar um subdomínio para testes antes de implantar no domínio principal
- Lembre-se de atualizar qualquer referência de URL absoluta em seu código se houver alguma

