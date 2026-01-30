import asyncio
import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from app.database import init_db
from app.api.routes import router as api_router
from app.bot.handlers import router as bot_router
from app.bot.notifications import NotificationService

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "http://localhost:5173")
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# Глобальные переменные для бота
bot = None
dp = None
notification_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    global bot, dp, notification_service

    # Startup
    logger.info("Starting application...")

    # Инициализация базы данных
    init_db()
    logger.info("Database initialized")

    # Инициализация бота
    if BOT_TOKEN:
        bot = Bot(
            token=BOT_TOKEN,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML)
        )
        dp = Dispatcher()
        dp.include_router(bot_router)

        # Инициализация сервиса уведомлений
        notification_service = NotificationService(bot)

        # Запуск бота в фоновом режиме
        asyncio.create_task(start_bot())
        logger.info("Bot started")
    else:
        logger.warning("BOT_TOKEN not set, bot will not start")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    if bot:
        await bot.session.close()


async def start_bot():
    """Запуск Telegram бота"""
    try:
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Bot polling error: {e}")


# Создание FastAPI приложения
app = FastAPI(
    title="Hatm Bot API",
    description="API для Telegram бота коллективного чтения Корана",
    version="1.0.0",
    lifespan=lifespan
)

# CORS настройки
cors_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    WEBAPP_URL,
    "https://web.telegram.org",
]
# В режиме разработки разрешаем все origins
if DEV_MODE:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if not DEV_MODE else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip сжатие для уменьшения размера ответов
app.add_middleware(GZipMiddleware, minimum_size=500)

# Подключение роутов API
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "status": "ok",
        "message": "Hatm Bot API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Проверка здоровья сервиса"""
    return {"status": "healthy"}


def get_notification_service() -> NotificationService:
    """Получить сервис уведомлений"""
    global notification_service
    return notification_service


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEV_MODE
    )
