# 🚀 Deploy Automático: Lovable → GitHub → Hostinger

Sempre que o Lovable enviar código ao GitHub, o GitHub Actions irá automaticamente:
1. Fazer build de produção (`npm run build`)
2. Enviar a pasta `dist/` via FTP para o seu `public_html` na Hostinger

## ⚙️ Configuração inicial (faz só uma vez)

### Passo 1 — Pegar credenciais FTP na Hostinger

1. Acesse o **hPanel** da Hostinger
2. Vá em **Arquivos → Contas FTP** (ou "FTP Accounts")
3. Anote (ou crie uma nova conta FTP):
   - **Host FTP** (ex: `ftp.seudominio.com` ou `145.14.xxx.xxx`)
   - **Usuário FTP** (ex: `u123456789.deploy`)
   - **Senha FTP**
   - **Caminho do diretório** (geralmente `/public_html/` ou `/domains/seudominio.com/public_html/`)

> 💡 Recomendado: crie uma **conta FTP separada** só para deploy, com acesso restrito ao `public_html`.

### Passo 2 — Adicionar segredos no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings → Secrets and variables → Actions → New repository secret**
3. Adicione os seguintes segredos:

| Nome do segredo | Valor |
|---|---|
| `HOSTINGER_FTP_HOST` | Host FTP da Hostinger (ex: `ftp.seudominio.com`) |
| `HOSTINGER_FTP_USER` | Usuário FTP |
| `HOSTINGER_FTP_PASSWORD` | Senha FTP |
| `HOSTINGER_FTP_PATH` | Caminho de destino (ex: `/public_html/`) |
| `VITE_SUPABASE_URL` | `https://vaabpicspdbolvutnscp.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sua chave anon do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | `vaabpicspdbolvutnscp` |

> ⚠️ Os valores `VITE_SUPABASE_*` estão no seu `.env` local — copie de lá.

### Passo 3 — Disparar o primeiro deploy

Você tem duas opções:

**Opção A — Automático**: faça qualquer alteração no Lovable. Ao sincronizar com GitHub, o workflow roda sozinho.

**Opção B — Manual**: vá em **GitHub → Actions → "Deploy para Hostinger" → Run workflow**.

## 📊 Acompanhar o deploy

- **GitHub → aba Actions** → veja o status (verde = sucesso, vermelho = erro)
- Cada execução tem logs detalhados de cada etapa
- Tempo médio: 2-4 minutos

## 🐛 Problemas comuns

| Erro | Solução |
|---|---|
| `530 Login authentication failed` | Verifique usuário/senha FTP nos secrets |
| `ENOTFOUND` no host | Confira se o host está correto (sem `http://`) |
| Site quebrado após deploy | Verifique se o `.htaccess` está em `public/` (já está ✅) |
| Build falha por env | Confira se os 3 secrets `VITE_SUPABASE_*` estão no GitHub |
| Deploy lento | Normal na primeira vez (envia tudo). Próximos serão incrementais |

## 🔒 Importante

- **Nunca** commite credenciais FTP no código — sempre via Secrets do GitHub
- O `.htaccess` em `public/` é incluído automaticamente no build
- Backend (Supabase) **não** é afetado pelo deploy — continua funcionando normalmente
