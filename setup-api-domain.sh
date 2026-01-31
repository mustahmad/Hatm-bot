#!/bin/bash
# Скрипт настройки nginx для api.quranhatm.ru
# Запускать из папки hatm-bot: ./setup-api-domain.sh

set -e

SERVER="root@46.19.66.253"

echo "=== Настройка API домена api.quranhatm.ru ==="

ssh $SERVER << 'ENDSSH'
set -e

echo "[1/3] Создание nginx конфига для API..."

# Создаём отдельный конфиг для API поддомена
cat > /etc/nginx/sites-available/hatm-api << 'EOF'
server {
    listen 80;
    server_name api.quranhatm.ru;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers for Vercel frontend
        add_header Access-Control-Allow-Origin "https://quranhatm.ru" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Telegram-Init-Data" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
EOF

echo "[2/3] Активация конфига..."
ln -sf /etc/nginx/sites-available/hatm-api /etc/nginx/sites-enabled/

echo "[3/3] Проверка и перезагрузка nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=== ГОТОВО! ==="
echo "API доступен по адресу: http://api.quranhatm.ru"
ENDSSH

echo ""
echo "Теперь нужно обновить переменную VITE_API_URL в Vercel на https://api.quranhatm.ru"
