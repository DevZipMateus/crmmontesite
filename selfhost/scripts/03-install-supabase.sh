#!/usr/bin/env bash
# Clona Supabase e sobe via docker compose
set -euo pipefail

INSTALL_DIR=/opt/supabase
SECRETS_FILE=/root/supabase-secrets.txt

echo "==> Clonando Supabase em $INSTALL_DIR"
if [ ! -d "$INSTALL_DIR" ]; then
  git clone --depth 1 https://github.com/supabase/supabase "$INSTALL_DIR"
fi

cd "$INSTALL_DIR/docker"

if [ ! -f .env ]; then
  echo "==> Gerando segredos novos"
  cp .env.example .env

  POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
  JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)
  DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 20)
  SECRET_KEY_BASE=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)
  VAULT_ENC_KEY=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)

  # JWT ANON/SERVICE — usar gerador online ou jwt-cli; placeholder por enquanto
  echo "  ⚠️  ANON_KEY e SERVICE_ROLE_KEY: gerar manualmente com JWT_SECRET acima"
  echo "     https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys"

  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
  sed -i "s|^DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD|" .env
  sed -i "s|^SECRET_KEY_BASE=.*|SECRET_KEY_BASE=$SECRET_KEY_BASE|" .env
  sed -i "s|^VAULT_ENC_KEY=.*|VAULT_ENC_KEY=$VAULT_ENC_KEY|" .env
  sed -i "s|^SITE_URL=.*|SITE_URL=https://crm.suaempresa.com|" .env
  sed -i "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://api.suaempresa.com|" .env
  sed -i "s|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://api.suaempresa.com|" .env

  # Bind só em localhost — Caddy expõe via HTTPS
  sed -i "s|^KONG_HTTP_PORT=.*|KONG_HTTP_PORT=8000|" .env
  sed -i "s|^KONG_HTTPS_PORT=.*|KONG_HTTPS_PORT=8443|" .env

  cat > "$SECRETS_FILE" <<EOF
=== Supabase self-hosted — gerado em $(date) ===
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD
SECRET_KEY_BASE=$SECRET_KEY_BASE
VAULT_ENC_KEY=$VAULT_ENC_KEY

⚠️  Gere ANON_KEY e SERVICE_ROLE_KEY a partir do JWT_SECRET em:
   https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
   Depois edite /opt/supabase/docker/.env e rode 'docker compose up -d'.
EOF
  chmod 600 "$SECRETS_FILE"
  echo ""
  echo "🔐 Segredos salvos em $SECRETS_FILE"
fi

echo "==> Pulling images (ARM64)"
docker compose pull

echo "==> Iniciando containers"
docker compose up -d

echo ""
echo "==> Aguardando containers ficarem saudáveis..."
sleep 30
docker compose ps

echo ""
echo "✅ Supabase no ar em http://localhost:8000"
echo "   Studio em http://localhost:3000"
echo "   Próximo passo: configurar Caddy (script 04)"
