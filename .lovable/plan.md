# Plano: Self-host do Supabase na Oracle Cloud (Always Free ARM)

## Arquitetura final

```text
┌─────────────────────────────────────────────────────────┐
│  HOSTINGER (frontends estáticos — já em uso)            │
│  ├── crm.suaempresa.com        (build do CRM Lovable)   │
│  ├── projeto2.suaempresa.com                            │
│  └── projeto3.suaempresa.com                            │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS (API + Auth + Storage)
                           ▼
┌─────────────────────────────────────────────────────────┐
│  ORACLE CLOUD — VM.Standard.A1.Flex (ARM)               │
│  4 vCPU / 24 GB RAM / 200 GB block volume / Ubuntu 24   │
│  ───────────────────────────────────────────────────    │
│  Caddy (reverse proxy + SSL automático Let's Encrypt)   │
│   ├── api.suaempresa.com    → Supabase Kong (porta 8000)│
│   ├── studio.suaempresa.com → Supabase Studio (3000)    │
│   └── (reservas para futuros backends de projetos 2/3)  │
│  ───────────────────────────────────────────────────    │
│  Supabase self-hosted (docker compose oficial)          │
│   Postgres • GoTrue • PostgREST • Storage • Realtime    │
│   Edge Functions (Deno) • Studio • Kong • Analytics     │
│  ───────────────────────────────────────────────────    │
│  Backups locais + sync para Object Storage Oracle       │
└─────────────────────────────────────────────────────────┘
```

A máquina **só** roda o backend. Frontends continuam na Hostinger — só muda a `VITE_SUPABASE_URL` para `https://api.suaempresa.com`.

## Capacidade da máquina (4 vCPU / 24 GB ARM)

Folgada para o cenário. Estimativa de consumo em regime:

| Serviço | RAM típica |
|---|---:|
| PostgreSQL (tuned 4 GB shared_buffers) | 4–6 GB |
| Storage + Kong + GoTrue + PostgREST + Realtime + Studio | 2–3 GB |
| Edge Functions runtime | 0.5–1 GB |
| Sistema + Docker overhead | 1 GB |
| **Sobra para 3 projetos extras** | **~12 GB** |

Suporta os 3 projetos extras compartilhando o mesmo Postgres (schemas separados) ou rodando containers próprios.

## Fases de implementação

### Fase 1 — Provisionar a VM Oracle
1. Criar **VM.Standard.A1.Flex**: 4 OCPU, 24 GB RAM, Ubuntu 24.04, 200 GB block volume (boot 50 GB + volume 150 GB para `/var/lib/docker`).
2. Abrir portas **22, 80, 443** no Security List + `iptables`.
3. Reservar **IP público fixo**.
4. Apontar DNS Hostinger: `api.suaempresa.com` e `studio.suaempresa.com` → IP da VM.

### Fase 2 — Hardening básico
- Usuário não-root `ubuntu` com sudo; SSH só por chave; fail2ban; UFW (22/80/443); swap de 4 GB; timezone America/Sao_Paulo.

### Fase 3 — Docker + Supabase
- Instalar Docker Engine + Compose plugin (ARM nativo).
- Clonar `supabase/supabase` (branch estável) → pasta `docker/`.
- Copiar `.env.example` → `.env` e gerar segredos novos: `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, `SMTP_*`, `SITE_URL=https://crm.suaempresa.com`.
- Subir `docker compose up -d`. Validar saúde de cada container.

### Fase 4 — Reverse proxy Caddy
- Caddyfile com 2 vhosts (`api.` e `studio.`), SSL automático Let's Encrypt, headers CORS para os domínios Hostinger.
- Studio protegido por basic auth.

### Fase 5 — Migrar dados do Supabase Cloud
1. **Dump do banco**: `pg_dump` da Cloud (33 MB) → restore no Postgres self-hosted.
2. **Migrar storage (5.4 GB)**: script Node que lista os 6 buckets via Service Role da Cloud, baixa e re-faz upload via Service Role da self-hosted (preservando paths e mime types). Log em CSV para auditoria.
3. **Recriar buckets e policies** (config dos buckets existentes: `site_personalizacoes`, `client-submissions`, `vitrine-imagens`, `template-images`, `Imagens`, `vendedor-fotos`).
4. **Edge Functions**: copiar pasta `supabase/functions/` para a VM, deploy via `supabase functions deploy --no-verify-jwt` (ou via CLI self-hosted).
5. **Secrets das functions**: replicar os 9 secrets existentes (`LOVABLE_API_KEY`, integrações Make, etc.).
6. **Usuários auth**: exportar/importar via `auth.users` SQL (mantendo hashes bcrypt).

### Fase 6 — Cutover do CRM
1. Em janela de baixa atividade, congelar escritas na Cloud (modo manutenção).
2. Rodar dump+restore final (delta).
3. No build do CRM, trocar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para os novos.
4. Rebuild + upload para Hostinger.
5. Testes smoke: login, listagem de leads, upload de mídia, edge functions, webhooks Make.
6. Manter Cloud em modo leitura por 7 dias como fallback.

### Fase 7 — Backups
- Cron diário: `pg_dump` comprimido + `tar` da pasta storage → `/backups/YYYY-MM-DD.tar.gz`.
- Retenção: 7 dias local + 30 dias em **Oracle Object Storage** (free tier 20 GB).
- Teste mensal de restore em pasta temporária.

### Fase 8 — Espaço para os outros 3 projetos
- Cada projeto novo pode:
  - **Compartilhar o mesmo Postgres** em `schema` próprio (mais simples, recomendado), OU
  - Subir um Postgres dedicado em outro container (mais isolado, mais RAM).
- Caddy ganha um vhost por projeto.

## Detalhes técnicos relevantes

- **ARM compat**: imagens oficiais do Supabase publicam `linux/arm64`. Confirmado para postgres, gotrue, storage-api, realtime, postgrest, kong, studio, edge-runtime.
- **Edge Functions** rodam em Deno dentro do container `edge-runtime` — mesma API da Cloud.
- **CORS**: Storage e PostgREST precisam liberar `https://crm.suaempresa.com` (configurado via env do Kong).
- **SMTP**: GoTrue precisa de SMTP externo para emails (pode ser o mesmo do Make/Resend já em uso).
- **Memória do Postgres**: ajustar `shared_buffers=4GB`, `effective_cache_size=12GB`, `work_mem=32MB` no `postgresql.conf`.
- **Limite Oracle Always Free**: 10 TB de tráfego/mês — confortável.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Always Free ARM indisponível na região | Tentar regiões alternativas (Vinhedo, São Paulo, Santiago) ou aceitar VM paga ~US$ 50/mês |
| Oracle reclamar instância ociosa | Manter uso de CPU/rede ativo (o CRM real já garante isso) |
| Perda de dados | Backup diário + replicação para Object Storage |
| Downtime no cutover | Janela noturna + fallback de 7 dias na Cloud |
| Edge functions com comportamento diferente | Testar cada uma em staging antes do cutover |

## Custo final estimado

| Item | Custo/mês |
|---|---:|
| Oracle VM ARM Always Free | **R$ 0** |
| Oracle Object Storage backups (<20 GB) | **R$ 0** |
| Supabase Cloud | **R$ 0** (downgrade para Free após 7 dias) |
| Hostinger (já existente) | inalterado |
| **Total adicional** | **R$ 0** |

## Próximo passo após aprovação

Começo gerando os artefatos de instalação: `docker-compose.override.yml`, `Caddyfile`, `.env.template`, `scripts/migrate-storage.ts`, `scripts/backup.sh`, e um `README-selfhost.md` passo a passo para você executar na VM assim que ela estiver provisionada. Nada no código do CRM muda nessa primeira entrega — só os arquivos de infra.