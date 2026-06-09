# Self-host do Supabase — CRM MonteSite

Guia passo a passo para subir o backend Supabase em uma VM Oracle Cloud ARM (Always Free) e migrar todos os dados do projeto Supabase Cloud atual (`vaabpicspdbolvutnscp`).

> **Nada no código do CRM muda agora.** Esta pasta contém apenas artefatos de infraestrutura. O cutover (trocar `VITE_SUPABASE_URL`) acontece só na Fase 6.

---

## Visão geral

```
HOSTINGER (frontends)                  ORACLE VM (backend)
crm.suaempresa.com  ───── HTTPS ─────▶ api.suaempresa.com    → Supabase Kong
projeto2.suaempresa.com                studio.suaempresa.com → Supabase Studio
projeto3.suaempresa.com
```

| Recurso Oracle | Valor |
|---|---|
| Shape | VM.Standard.A1.Flex (ARM Ampere) |
| OCPU / RAM | 4 / 24 GB |
| Boot volume | 50 GB |
| Block volume extra | 150 GB (montado em `/var/lib/docker`) |
| SO | Ubuntu 24.04 LTS aarch64 |
| Portas abertas | 22, 80, 443 |
| Custo | R$ 0 (Always Free) |

---

## Fase 1 — Provisionar a VM

1. Console Oracle → **Compute → Instances → Create Instance**
2. Image: **Canonical Ubuntu 24.04** (aarch64)
3. Shape: **VM.Standard.A1.Flex** — 4 OCPU, 24 GB RAM
4. Networking: VCN nova ou existente; **Assign a public IPv4** ✅
5. SSH: cole sua chave pública
6. **Boot volume**: 50 GB (default)
7. Após criar a VM: **Block Volumes → Create Block Volume** 150 GB → Attach → Paravirtualized
8. Reservar IP público fixo: **Networking → Reserved Public IPs**
9. **Security List** (VCN → Subnet → Security List): ingress rules para `0.0.0.0/0` em **TCP 22, 80, 443**

### DNS Hostinger
- `api.suaempresa.com` → IP da VM (A record)
- `studio.suaempresa.com` → IP da VM (A record)
- (futuro) `api2.`, `api3.` para outros projetos

---

## Fase 2 — Hardening básico

SSH na VM como `ubuntu`, depois rode:

```bash
sudo bash scripts/01-hardening.sh
```

Faz: update do sistema, swap 4 GB, timezone, fail2ban, UFW (22/80/443), bloqueia login root via SSH, formata e monta o block volume em `/var/lib/docker`.

---

## Fase 3 — Docker + Supabase

```bash
sudo bash scripts/02-install-docker.sh
sudo bash scripts/03-install-supabase.sh
```

Resultado:
- Supabase clonado em `/opt/supabase`
- `.env` gerado com segredos novos (salvos também em `/root/supabase-secrets.txt` — **copie e guarde**)
- `docker compose up -d` executado
- Containers saudáveis em ~2 minutos

Validar:
```bash
cd /opt/supabase/docker
docker compose ps
curl -s http://localhost:8000/rest/v1/ -H "apikey: $ANON_KEY"
```

---

## Fase 4 — Reverse proxy (Caddy)

```bash
sudo bash scripts/04-install-caddy.sh
sudo cp caddy/Caddyfile /etc/caddy/Caddyfile
# editar domínios e e-mail no Caddyfile
sudo systemctl reload caddy
```

Caddy emite SSL Let's Encrypt automaticamente. Studio fica protegido por basic auth.

---

## Fase 5 — Migrar dados do Supabase Cloud

### 5.1 Banco (33 MB)

Na **sua máquina local** (ou na VM, com `psql` instalado):

```bash
# Exportar da Cloud
pg_dump "postgresql://postgres:[SENHA]@db.vaabpicspdbolvutnscp.supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists \
  -f cloud-dump.sql

# Importar na self-hosted (substituir senha local)
psql "postgresql://postgres:[SENHA_LOCAL]@SEU.IP.ORACLE:5432/postgres" \
  -f cloud-dump.sql
```

> A porta 5432 NÃO deve ficar pública no firewall. Use SSH tunnel: `ssh -L 5432:localhost:5432 ubuntu@SEU.IP.ORACLE`

### 5.2 Storage (5.4 GB, 6 buckets)

```bash
cd selfhost/scripts
cp .env.migrate.example .env.migrate
# preencher SOURCE_* (Cloud) e TARGET_* (self-hosted)
bun install
bun run migrate-storage.ts
```

Gera `migration-log.csv` com todos os arquivos migrados. Idempotente — pode re-rodar.

### 5.3 Edge Functions

Já temos as funções em `supabase/functions/`. Na VM:

```bash
# Instalar Supabase CLI (binário ARM)
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_arm64.tar.gz | sudo tar xz -C /usr/local/bin

# Apontar para self-hosted
supabase link --project-ref local --workdir /opt/crm
supabase functions deploy --no-verify-jwt
```

### 5.4 Secrets das Edge Functions

Lista atual (9 secrets) — replicar na self-hosted via `.env` do `edge-runtime`:

```
LOVABLE_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PUBLISHABLE_KEY
SUPABASE_PUBLISHABLE_KEYS
SUPABASE_SECRET_KEYS
SUPABASE_JWKS
SUPABASE_DB_URL
```

Os `SUPABASE_*` são reescritos para os valores locais; `LOVABLE_API_KEY` é copiado.

### 5.5 Usuários auth

```bash
pg_dump --data-only --table=auth.users --table=auth.identities \
  "postgresql://postgres:[SENHA]@db.vaabpicspdbolvutnscp.supabase.co:5432/postgres" \
  -f auth-dump.sql

psql "postgresql://...self-hosted..." -f auth-dump.sql
```

Hashes bcrypt são preservados — logins funcionam direto.

---

## Fase 6 — Cutover do CRM

Janela noturna recomendada. Passos:

1. Avisar equipe: modo manutenção (1h).
2. Rodar migração delta (dump + restore + storage sync incremental).
3. No projeto CRM, atualizar `.env.production`:
   ```
   VITE_SUPABASE_URL=https://api.suaempresa.com
   VITE_SUPABASE_PUBLISHABLE_KEY=<NOVO_ANON_KEY>
   VITE_SUPABASE_PROJECT_ID=local
   ```
4. `npm run build` e upload do `dist/` para Hostinger.
5. Smoke tests: login, lista de leads, upload de mídia, edge functions, webhook Make.
6. Manter Cloud em **read-only** por 7 dias como fallback.
7. Após 7 dias sem incidente: downgrade Cloud para Free.

---

## Fase 7 — Backups

```bash
sudo cp scripts/backup.sh /opt/supabase/backup.sh
sudo chmod +x /opt/supabase/backup.sh
sudo crontab -e
# adicionar:
0 3 * * * /opt/supabase/backup.sh >> /var/log/supabase-backup.log 2>&1
```

Faz: `pg_dump` comprimido + tar do `/opt/supabase/docker/volumes/storage` → `/backups/`.
Retenção 7 dias local. Para 30 dias em Oracle Object Storage, configure `rclone` (instruções no script).

---

## Fase 8 — Outros 3 projetos

Recomendado: **mesmo Postgres, schemas separados**.

```sql
CREATE SCHEMA projeto2;
GRANT USAGE ON SCHEMA projeto2 TO anon, authenticated, service_role;
-- repetir para projeto3, projeto4
```

Para cada projeto novo, adicione um vhost no `Caddyfile`:
```
api2.suaempresa.com {
  reverse_proxy localhost:8000
  header Access-Control-Allow-Origin "https://projeto2.suaempresa.com"
}
```

E configure o frontend desse projeto com as mesmas `ANON_KEY`/`SERVICE_ROLE_KEY` (ou crie chaves separadas via JWT custom).

---

## Troubleshooting

| Sintoma | Causa provável | Fix |
|---|---|---|
| Container `studio` reiniciando | RAM insuficiente | Verifique `free -h`; ajuste swap |
| `permission denied` em upload | RLS de storage | Reaplique policies via Studio |
| Edge function 500 | Secret faltando | `docker compose logs edge-runtime` |
| CORS error no browser | Caddy sem header | Adicione `Access-Control-Allow-Origin` |
| SSL falha | DNS não propagou | `dig api.suaempresa.com`; aguarde 10 min |

---

## Custo

| Item | R$/mês |
|---|---:|
| Oracle VM ARM Always Free | 0 |
| Oracle Object Storage (<20 GB) | 0 |
| Supabase Cloud (após cutover) | 0 (downgrade Free) |
| **Total** | **R$ 0** |
