#!/bin/bash
set -e

echo "=== Настройка сервера для Hatm Bot ==="

# 1. Установка зависимостей
echo "[1/7] Установка пакетов..."
apt update
apt install -y python3 python3-pip python3-venv nginx git

# 2. Остановка старых процессов
echo "[2/7] Остановка старых процессов..."
pkill -f uvicorn || true
systemctl stop hatm 2>/dev/null || true

# 3. Создаём директории
echo "[3/7] Создание директорий..."
mkdir -p /var/www/hatm-bot/backend
mkdir -p /var/www/hatm-bot/frontend

# 4. Копируем файлы (если загружены в /root)
echo "[4/7] Копирование файлов..."
if [ -d "/root/hatm-bot-backend" ]; then
    cp -r /root/hatm-bot-backend/* /var/www/hatm-bot/backend/
fi
if [ -d "/root/hatm-bot-frontend" ]; then
    cp -r /root/hatm-bot-frontend/* /var/www/hatm-bot/frontend/
fi

# 5. Настройка бэкенда
echo "[5/7] Настройка бэкенда..."
cd /var/www/hatm-bot/backend

# Создаём venv если нет
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Копируем .env если есть в /root
if [ -f "/root/hatm-bot-backend/.env" ] && [ ! -f ".env" ]; then
    cp /root/hatm-bot-backend/.env .env
fi

# Добавляем DEV_MODE если нет
grep -q "DEV_MODE" .env 2>/dev/null || echo "DEV_MODE=true" >> .env

deactivate

# 6. Создаём systemd сервис
echo "[6/7] Создание systemd сервиса..."
cat > /etc/systemd/system/hatm.service << 'EOF'
[Unit]
Description=Hatm Bot Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/hatm-bot/backend
Environment=PATH=/var/www/hatm-bot/backend/venv/bin:/usr/bin
EnvironmentFile=/var/www/hatm-bot/backend/.env
ExecStart=/var/www/hatm-bot/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Собираем фронтенд
echo "[7/7] Сборка фронтенда..."
cd /var/www/hatm-bot/frontend

# Устанавливаем Node.js если нет
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

npm install
VITE_API_URL=http://46.19.66.253:8000 npm run build

# 8. Устанавливаем права доступа
echo "[8/8] Настройка прав доступа..."
chown -R www-data:www-data /var/www/hatm-bot
chmod -R 755 /var/www/hatm-bot

# 9. Настройка nginx
echo "[9/9] Настройка nginx..."
cat > /etc/nginx/sites-available/hatm << 'EOF'
server {
    listen 80;
    server_name 46.19.66.253 hatmbot.mooo.com;

    # Frontend
    location / {
        root /var/www/hatm-bot/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/hatm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Запускаем сервисы
systemctl daemon-reload
systemctl enable hatm
systemctl start hatm
nginx -t && systemctl reload nginx

echo ""
echo "=== ГОТОВО! ==="
echo "Бэкенд: systemctl status hatm"
echo "Логи: journalctl -u hatm -f"
echo "Сайт: http://46.19.66.253"
echo ""
