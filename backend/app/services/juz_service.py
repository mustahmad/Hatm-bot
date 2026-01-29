from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.models import JuzAssignment, JuzStatus, User, Hatm, HatmStatus
from app.schemas.schemas import JuzResponse, UserJuzStats, UserDebtResponse


class JuzService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, juz_id: int) -> Optional[JuzAssignment]:
        """Получить джуз по ID"""
        return self.db.query(JuzAssignment).filter(JuzAssignment.id == juz_id).first()

    def mark_completed(self, juz: JuzAssignment) -> JuzAssignment:
        """Отметить джуз как прочитанный"""
        juz.status = JuzStatus.COMPLETED
        juz.completed_at = datetime.utcnow()
        if juz.is_debt:
            juz.is_debt = False  # Погашен долг
        self.db.commit()
        self.db.refresh(juz)
        return juz

    def get_user_juzs(self, user: User, hatm_id: int = None) -> List[JuzAssignment]:
        """Получить джузы пользователя"""
        query = self.db.query(JuzAssignment).filter(JuzAssignment.user_id == user.id)
        if hatm_id:
            query = query.filter(JuzAssignment.hatm_id == hatm_id)
        return query.order_by(JuzAssignment.juz_number).all()

    def get_user_active_juzs(self, user: User) -> List[JuzAssignment]:
        """Получить активные (невыполненные) джузы пользователя из активных хатмов"""
        return (
            self.db.query(JuzAssignment)
            .join(Hatm)
            .filter(
                JuzAssignment.user_id == user.id,
                JuzAssignment.status == JuzStatus.PENDING,
                Hatm.status == HatmStatus.ACTIVE
            )
            .order_by(JuzAssignment.juz_number)
            .all()
        )

    def get_user_debts(self, user: User) -> List[JuzAssignment]:
        """Получить долги пользователя"""
        return (
            self.db.query(JuzAssignment)
            .filter(
                JuzAssignment.user_id == user.id,
                JuzAssignment.is_debt == True
            )
            .order_by(JuzAssignment.juz_number)
            .all()
        )

    def get_user_stats(self, user: User) -> UserJuzStats:
        """Получить статистику пользователя по джузам"""
        all_juzs = self.get_user_juzs(user)

        completed = sum(1 for j in all_juzs if j.status == JuzStatus.COMPLETED)
        pending = sum(1 for j in all_juzs if j.status == JuzStatus.PENDING)
        debts = sum(1 for j in all_juzs if j.is_debt)

        juz_responses = []
        for j in all_juzs:
            juz_responses.append(JuzResponse(
                id=j.id,
                juz_number=j.juz_number,
                status=j.status,
                user_id=j.user_id,
                completed_at=j.completed_at,
                is_debt=j.is_debt
            ))

        return UserJuzStats(
            total_assigned=len(all_juzs),
            completed=completed,
            pending=pending,
            debts=debts,
            juzs=juz_responses
        )

    def get_user_debt_response(self, user: User) -> UserDebtResponse:
        """Получить ответ с долгами пользователя"""
        debts = self.get_user_debts(user)

        debt_responses = []
        for d in debts:
            debt_responses.append(JuzResponse(
                id=d.id,
                juz_number=d.juz_number,
                status=d.status,
                user_id=d.user_id,
                completed_at=d.completed_at,
                is_debt=d.is_debt
            ))

        return UserDebtResponse(
            debts=debt_responses,
            total_debts=len(debts)
        )

    def get_juz_with_user_info(self, juz: JuzAssignment) -> JuzResponse:
        """Получить информацию о джузе с данными пользователя"""
        user = self.db.query(User).filter(User.id == juz.user_id).first()
        return JuzResponse(
            id=juz.id,
            juz_number=juz.juz_number,
            status=juz.status,
            user_id=juz.user_id,
            username=user.username if user else None,
            first_name=user.first_name if user else None,
            completed_at=juz.completed_at,
            is_debt=juz.is_debt
        )
