#!/usr/bin/env bash
# Instala Caddy (reverse proxy + SSL automático)
set -euo pipefail

apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  tee /etc/apt/sources.list.d/caddy-stable.list

apt-get update -y
apt-get install -y caddy

systemctl enable --now caddy

echo ""
echo "✅ Caddy instalado."
echo "   Copie selfhost/caddy/Caddyfile para /etc/caddy/Caddyfile"
echo "   Edite os domínios e e-mail, depois: sudo systemctl reload caddy"
