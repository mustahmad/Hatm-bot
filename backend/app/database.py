from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, StaticPool
import os

# Railway использует postgres://, но SQLAlchemy требует postgresql://
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hatm.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Оптимизированные настройки для PostgreSQL
if "sqlite" in DATABASE_URL:
    # SQLite - для локальной разработки
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    # PostgreSQL - с connection pooling для продакшена
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,           # Базовый размер пула
        max_overflow=30,        # Дополнительные соединения при пиковой нагрузке
        pool_timeout=30,        # Таймаут ожидания соединения
        pool_recycle=1800,      # Переподключение каждые 30 минут
        pool_pre_ping=True,     # Проверка соединения перед использованием
        echo=False              # Отключить SQL логирование
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency для получения сессии базы данных"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Инициализация базы данных"""
    from app.models import models  # noqa
    Base.metadata.create_all(bind=engine)
