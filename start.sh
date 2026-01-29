#!/bin/bash

# Скрипт запуска Hatm Bot

echo "=== Хатм Бот - Запуск ==="

# Убиваем старые процессы
pkill -f "python -m app.main" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
sleep 2

# Запуск Backend
echo "Запуск Backend..."
cd /Users/user/hatm-bot/backend
source venv/bin/activate
python -m app.main &
BACKEND_PID=$!
sleep 3

# Запуск Frontend
echo "Запуск Frontend..."
cd /Users/user/hatm-bot/frontend
npm run dev &
FRONTEND_PID=$!
sleep 3

# Запуск туннелей
echo "Запуск Cloudflare туннелей..."
/Users/user/cloudflared tunnel --url http://localhost:5173 > /tmp/cf_frontend.log 2>&1 &
CF_FRONTEND_PID=$!
/Users/user/cloudflared tunnel --url http://localhost:8000 > /tmp/cf_backend.log 2>&1 &
CF_BACKEND_PID=$!
sleep 6

# Получаем URL туннелей
FRONTEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' /tmp/cf_frontend.log | head -1)
BACKEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' /tmp/cf_backend.log | head -1)

echo ""
echo "=== ГОТОВО ==="
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo ""
echo "=== СЛЕДУЮЩИЙ ШАГ ==="
echo "Настройте Menu Button в @BotFather:"
echo "1. Откройте @BotFather в Telegram"
echo "2. /mybots → Выберите бота → Bot Settings → Menu Button → Configure menu button"
echo "3. Введите URL: $FRONTEND_URL"
echo "4. Введите текст: Открыть приложение"
echo ""
echo "Затем откройте бота и нажмите /start"
echo ""
echo "Для остановки: pkill -f 'python -m app.main'; pkill -f vite; pkill -f cloudflared"
echo ""

# Ждём
wait
