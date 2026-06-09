#!/usr/bin/env bash
# Hardening básico da VM Oracle Ubuntu 24.04 ARM
# Rodar como root: sudo bash 01-hardening.sh
set -euo pipefail

echo "==> [1/7] Atualizando sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget git ufw fail2ban htop ncdu unzip jq

echo "==> [2/7] Timezone America/Sao_Paulo"
timedatectl set-timezone America/Sao_Paulo

echo "==> [3/7] Swap de 4 GB"
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

echo "==> [4/7] Firewall UFW (22, 80, 443)"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Oracle usa iptables também — liberar nas regras nativas
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT  || true
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
netfilter-persistent save || apt-get install -y iptables-persistent

echo "==> [5/7] Fail2ban"
systemctl enable --now fail2ban

echo "==> [6/7] SSH hardening (sem login root via senha)"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

echo "==> [7/7] Montagem do block volume em /var/lib/docker"
# Localizar disco extra (não-boot)
DEVICE=$(lsblk -dnp -o NAME,TYPE,MOUNTPOINT | awk '$2=="disk" && $3=="" {print $1; exit}')
if [ -n "$DEVICE" ] && [ ! -d /var/lib/docker ]; then
  echo "  Formatando $DEVICE como ext4"
  mkfs.ext4 -F "$DEVICE"
  mkdir -p /var/lib/docker
  UUID=$(blkid -s UUID -o value "$DEVICE")
  echo "UUID=$UUID /var/lib/docker ext4 defaults,_netdev,nofail 0 2" >> /etc/fstab
  mount /var/lib/docker
else
  echo "  Pulado (sem disco extra ou /var/lib/docker já existe)"
fi

echo ""
echo "✅ Hardening concluído."
echo "   Reinicie a VM antes de continuar: sudo reboot"
