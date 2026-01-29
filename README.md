# Хатм Бот - Telegram бот для коллективного чтения Корана

Telegram-бот и Web App для организации коллективного чтения Корана (хатм) группами пользователей.

## Возможности

- Создание групп для совместного хатма
- Автоматическое распределение 30 джузов между участниками
- Круговой трекер прогресса с анимациями
- Уведомления в Telegram о назначенных джузах
- Кнопка "Прочитал" для отметки выполнения
- Система учета долгов
- Минималистичный Apple-подобный дизайн

## Структура проекта

```
hatm-bot/
├── backend/           # Python FastAPI + aiogram
│   ├── app/
│   │   ├── api/       # REST API endpoints
│   │   ├── bot/       # Telegram bot handlers
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Подробная инструкция по запуску

### Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)

2. Отправьте команду `/newbot`

3. Следуйте инструкциям:
   - Введите имя бота (например: `Хатм Бот`)
   - Введите username бота (например: `hatm_quran_bot`)

4. **Сохраните токен бота** - он понадобится позже. Выглядит примерно так:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

5. Настройте Web App для бота:
   - Отправьте `/mybots` боту @BotFather
   - Выберите вашего бота
   - Нажмите `Bot Settings` → `Menu Button` → `Configure menu button`
   - Введите URL вашего Web App (настроим позже)

### Шаг 2: Установка зависимостей

#### Требования:
- Python 3.11+
- Node.js 18+
- npm или yarn

#### Backend:

```bash
cd hatm-bot/backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте его
# На macOS/Linux:
source venv/bin/activate
# На Windows:
venv\Scripts\activate

# Установите зависимости
pip install -r requirements.txt
```

#### Frontend:

```bash
cd hatm-bot/frontend

# Установите зависимости
npm install
```

### Шаг 3: Настройка переменных окружения

#### Backend (.env):

```bash
cd hatm-bot/backend
cp .env.example .env
```

Отредактируйте файл `.env`:

```env
# Токен вашего бота от @BotFather
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# URL вашего Web App (настроим в шаге 5)
WEBAPP_URL=https://your-ngrok-url.ngrok.io

# Режим разработки (true для локальной разработки)
DEV_MODE=true

# База данных (SQLite по умолчанию)
DATABASE_URL=sqlite:///./hatm.db
```

#### Frontend (.env):

```bash
cd hatm-bot/frontend
cp .env.example .env
```

Отредактируйте файл `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### Шаг 4: Запуск локально (для разработки)

#### Терминал 1 - Backend:

```bash
cd hatm-bot/backend
source venv/bin/activate  # или venv\Scripts\activate на Windows
python -m app.main
```

Сервер запустится на `http://localhost:8000`

#### Терминал 2 - Frontend:

```bash
cd hatm-bot/frontend
npm run dev
```

Web App запустится на `http://localhost:5173`

### Шаг 5: Настройка HTTPS для Telegram (ngrok)

Telegram требует HTTPS для Web App. Используйте ngrok для создания туннеля.

1. Установите ngrok: https://ngrok.com/download

2. Запустите ngrok для frontend:
   ```bash
   ngrok http 5173
   ```

3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

4. Обновите настройки:

   **Backend `.env`:**
   ```env
   WEBAPP_URL=https://abc123.ngrok.io
   ```

   **Frontend `.env`:**
   ```env
   VITE_API_URL=https://your-backend-ngrok-url.ngrok.io
   ```

5. Если backend тоже нужен через HTTPS, запустите второй ngrok:
   ```bash
   ngrok http 8000
   ```

6. Настройте Menu Button в @BotFather:
   - `/mybots` → Выберите бота → `Bot Settings` → `Menu Button` → `Configure menu button`
   - URL: ваш ngrok URL для frontend
   - Text: `Открыть приложение`

### Шаг 6: Тестирование

1. Откройте бота в Telegram

2. Нажмите `/start`

3. Нажмите кнопку "Открыть приложение" или кнопку в меню

4. Создайте группу, пригласите друзей по коду, создайте хатм!

---

## Развертывание на сервере (Production)

### Вариант 1: VPS (DigitalOcean, Hetzner, etc.)

1. **Подготовка сервера:**
   ```bash
   # Установите необходимые пакеты
   sudo apt update
   sudo apt install python3.11 python3.11-venv nodejs npm nginx certbot
   ```

2. **Клонируйте репозиторий:**
   ```bash
   git clone your-repo-url hatm-bot
   cd hatm-bot
   ```

3. **Настройте Backend:**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Создайте .env с production настройками
   cp .env.example .env
   nano .env  # Заполните BOT_TOKEN и WEBAPP_URL
   ```

4. **Настройте Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build  # Создаст папку dist/
   ```

5. **Настройте Nginx:**
   ```nginx
   # /etc/nginx/sites-available/hatm

   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/hatm-bot/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # API
       location /api {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Получите SSL сертификат:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

7. **Запустите backend как сервис:**
   ```bash
   # /etc/systemd/system/hatm-bot.service

   [Unit]
   Description=Hatm Bot
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/path/to/hatm-bot/backend
   Environment="PATH=/path/to/hatm-bot/backend/venv/bin"
   ExecStart=/path/to/hatm-bot/backend/venv/bin/python -m app.main
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable hatm-bot
   sudo systemctl start hatm-bot
   ```

### Вариант 2: Railway / Render / Fly.io

Эти платформы предоставляют простое развертывание:

1. Подключите GitHub репозиторий
2. Укажите переменные окружения (BOT_TOKEN, WEBAPP_URL)
3. Платформа автоматически определит Python/Node.js проекты
4. Настройте домен и SSL

---

## Команды бота

- `/start` - Начало работы, открытие Web App
- `/myjuzs` - Показать текущие джузы
- `/debts` - Показать долги

## API Endpoints

- `GET /api/users/me` - Текущий пользователь
- `GET /api/groups` - Список групп пользователя
- `POST /api/groups` - Создать группу
- `POST /api/groups/join` - Вступить в группу
- `POST /api/groups/{id}/hatms` - Создать хатм
- `POST /api/hatms/{id}/start` - Запустить хатм
- `GET /api/hatms/{id}/progress` - Прогресс хатма
- `POST /api/juzs/{id}/complete` - Отметить джуз прочитанным

## Технологии

- **Backend:** Python, FastAPI, aiogram 3, SQLAlchemy, SQLite
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Telegram:** Bot API, Mini Apps

## Лицензия

MIT

---

Баракаллаху фикум! 🤲
