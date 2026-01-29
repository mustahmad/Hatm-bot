from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import User
from app.schemas.schemas import UserCreate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Получить пользователя по Telegram ID"""
        return self.db.query(User).filter(User.telegram_id == telegram_id).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Получить пользователя по ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user_data: UserCreate) -> User:
        """Создать нового пользователя"""
        user = User(
            telegram_id=user_data.telegram_id,
            username=user_data.username,
            first_name=user_data.first_name
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_or_create(self, telegram_id: int, username: str = None, first_name: str = None) -> User:
        """Получить или создать пользователя"""
        user = self.get_by_telegram_id(telegram_id)
        if not user:
            user_data = UserCreate(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name
            )
            user = self.create(user_data)
        else:
            # Обновить данные если изменились
            updated = False
            if username and user.username != username:
                user.username = username
                updated = True
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if updated:
                self.db.commit()
                self.db.refresh(user)
        return user

    def update(self, user: User, username: str = None, first_name: str = None) -> User:
        """Обновить данные пользователя"""
        if username:
            user.username = username
        if first_name:
            user.first_name = first_name
        self.db.commit()
        self.db.refresh(user)
        return user
