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

    # Автоматические миграции
    run_migrations()


def run_migrations():
    """Выполнить миграции базы данных"""
    from sqlalchemy import text
    import logging

    with engine.connect() as conn:
        # Миграция: сделать user_id nullable в juz_assignments
        if "postgresql" in DATABASE_URL:
            try:
                # Проверяем, является ли колонка nullable
                result = conn.execute(text("""
                    SELECT is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'juz_assignments' AND column_name = 'user_id'
                """))
                row = result.fetchone()

                if row and row[0] == 'NO':
                    # Колонка NOT NULL - нужно изменить
                    conn.execute(text("ALTER TABLE juz_assignments ALTER COLUMN user_id DROP NOT NULL"))
                    conn.commit()
                    logging.info("Migration: user_id in juz_assignments is now nullable")
            except Exception as e:
                logging.warning(f"Migration check failed (may be OK on first run): {e}")
