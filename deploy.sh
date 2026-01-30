#!/bin/bash
# Скрипт деплоя с локальной машины на сервер
# Запускать из папки hatm-bot: ./deploy.sh

set -e

SERVER="root@46.19.66.253"
REMOTE_DIR="/var/www/hatm-bot"

echo "=== Деплой Hatm Bot ==="

# 1. Загружаем бэкенд
echo "[1/4] Загрузка бэкенда..."
rsync -avz --exclude 'venv' --exclude '__pycache__' --exclude '*.pyc' --exclude '.env' \
    backend/ $SERVER:$REMOTE_DIR/backend/

# 2. Загружаем фронтенд
echo "[2/4] Загрузка фронтенда..."
rsync -avz --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SERVER:$REMOTE_DIR/frontend/

# 3. Запускаем сборку и перезапуск на сервере
echo "[3/4] Сборка и перезапуск на сервере..."
ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/hatm-bot/frontend
npm install
VITE_API_URL=http://46.19.66.253:8000 npm run build

cd /var/www/hatm-bot/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

chown -R www-data:www-data /var/www/hatm-bot
systemctl restart hatm

echo "Статус бэкенда:"
systemctl status hatm --no-pager | head -5
ENDSSH

echo ""
echo "[4/4] Готово!"
echo "Сайт: http://46.19.66.253"
