#!/usr/bin/env bash
set -e

NGINX_SITES_AVAIL="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

create_site() {
  local domain=$1
  local port=$2
  local conf_path="$NGINX_SITES_AVAIL/$domain.conf"

  echo "Creating Nginx config for $domain -> http://127.0.0.1:$port"

  sudo tee "$conf_path" > /dev/null <<EOF
server {
  listen 80;
  server_name $domain;
  client_max_body_size 50M;

  location / {
    proxy_pass http://127.0.0.1:$port;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF

  sudo ln -sf "$conf_path" "$NGINX_SITES_ENABLED/$domain.conf"
}

# Ensure Nginx dirs exist
sudo mkdir -p "$NGINX_SITES_AVAIL" "$NGINX_SITES_ENABLED"

# Create configs
create_site "studysen.fr" 3000
create_site "clubs.studysen.fr" 5173

# Add SSL certificates for the domains using Certbot
echo "Issuing SSL certificates via Certbot..."

sudo certbot --nginx -d studysen.fr -d www.studysen.fr --non-interactive --agree-tos --email contact@studysen.fr
sudo certbot --nginx -d clubs.studysen.fr -d www.clubs.studysen.fr --non-interactive --agree-tos --email contact@studysen.fr

# Test configuration
echo "Testing Nginx config..."
sudo nginx -t

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "Setup complete — Nginx is proxying the domains correctly."
