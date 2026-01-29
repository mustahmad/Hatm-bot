from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
import hashlib
import hmac
import json
from urllib.parse import parse_qsl
import os

from app.database import get_db
from app.services import UserService, GroupService, HatmService, JuzService
from app.models.models import User


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_group_service(db: Session = Depends(get_db)) -> GroupService:
    return GroupService(db)


def get_hatm_service(db: Session = Depends(get_db)) -> HatmService:
    return HatmService(db)


def get_juz_service(db: Session = Depends(get_db)) -> JuzService:
    return JuzService(db)


def validate_telegram_data(init_data: str) -> dict:
    """
    Валидация данных от Telegram Mini App.
    Возвращает словарь с данными пользователя если валидация успешна.
    """
    bot_token = os.getenv("BOT_TOKEN", "")

    # Парсим init_data
    parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))

    if "hash" not in parsed_data:
        raise HTTPException(status_code=401, detail="Отсутствует hash в данных")

    received_hash = parsed_data.pop("hash")

    # Создаем строку для проверки
    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed_data.items())
    )

    # Создаем secret key
    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()

    # Вычисляем hash
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    # Сравниваем hash (в dev режиме можно пропустить проверку)
    if os.getenv("DEV_MODE", "false").lower() != "true":
        if not hmac.compare_digest(calculated_hash, received_hash):
            raise HTTPException(status_code=401, detail="Невалидные данные Telegram")

    # Парсим данные пользователя
    if "user" in parsed_data:
        user_data = json.loads(parsed_data["user"])
        return user_data

    raise HTTPException(status_code=401, detail="Отсутствуют данные пользователя")


async def get_current_user(
    x_telegram_init_data: str = Header(None, alias="X-Telegram-Init-Data"),
    db: Session = Depends(get_db)
) -> User:
    """
    Получить текущего пользователя из Telegram Init Data.
    """
    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="Требуется авторизация через Telegram")

    try:
        user_data = validate_telegram_data(x_telegram_init_data)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Ошибка валидации данных Telegram")

    telegram_id = user_data.get("id")
    if not telegram_id:
        raise HTTPException(status_code=401, detail="Отсутствует ID пользователя")

    user_service = UserService(db)
    user = user_service.get_or_create(
        telegram_id=telegram_id,
        username=user_data.get("username"),
        first_name=user_data.get("first_name")
    )

    return user
