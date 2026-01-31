import random
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from app.models.models import Hatm, HatmStatus, JuzAssignment, JuzStatus, Group, GroupMember, User
from app.schemas.schemas import HatmCreate, HatmProgress, JuzResponse


class HatmService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, group: Group, hatm_data: HatmCreate) -> Hatm:
        """Создать новый хатм"""
        hatm = Hatm(
            group_id=group.id,
            duration_days=hatm_data.duration_days,
            participants_count=hatm_data.participants_count,
            status=HatmStatus.PENDING
        )
        self.db.add(hatm)
        self.db.commit()
        self.db.refresh(hatm)
        return hatm

    def get_by_id(self, hatm_id: int) -> Optional[Hatm]:
        """Получить хатм по ID"""
        return self.db.query(Hatm).filter(Hatm.id == hatm_id).first()

    def get_group_hatms(self, group: Group) -> List[Hatm]:
        """Получить все хатмы группы"""
        return self.db.query(Hatm).filter(Hatm.group_id == group.id).order_by(Hatm.created_at.desc()).all()

    def get_active_hatm(self, group: Group) -> Optional[Hatm]:
        """Получить активный хатм группы"""
        return (
            self.db.query(Hatm)
            .filter(Hatm.group_id == group.id, Hatm.status == HatmStatus.ACTIVE)
            .first()
        )

    def start(self, hatm: Hatm, participants: List[User]) -> Hatm:
        """Запустить хатм и распределить джузы"""
        if hatm.status != HatmStatus.PENDING:
            raise ValueError("Хатм уже запущен или завершен")

        if len(participants) == 0:
            raise ValueError("Нет участников для распределения")

        # Установить время начала и окончания
        hatm.started_at = datetime.utcnow()
        hatm.ends_at = hatm.started_at + timedelta(days=hatm.duration_days)
        hatm.status = HatmStatus.ACTIVE
        hatm.participants_count = len(participants)

        # Распределить 30 джузов между участниками
        self._distribute_juzs(hatm, participants)

        self.db.commit()
        self.db.refresh(hatm)
        return hatm

    def _distribute_juzs(self, hatm: Hatm, participants: List[User]):
        """
        Распределить 30 джузов между участниками случайным образом.
        Равное распределение, остаток по одному на участников.
        """
        total_juzs = 30
        num_participants = len(participants)

        # Создаём список всех джузов и перемешиваем
        juz_numbers = list(range(1, total_juzs + 1))
        random.shuffle(juz_numbers)

        # Базовое количество джузов на участника
        base_juzs = total_juzs // num_participants
        # Остаток, который нужно распределить
        remainder = total_juzs % num_participants

        juz_index = 0
        for i, user in enumerate(participants):
            # Определяем сколько джузов получает этот участник
            juzs_for_user = base_juzs + (1 if i < remainder else 0)

            for _ in range(juzs_for_user):
                assignment = JuzAssignment(
                    hatm_id=hatm.id,
                    user_id=user.id,
                    juz_number=juz_numbers[juz_index],
                    status=JuzStatus.PENDING
                )
                self.db.add(assignment)
                juz_index += 1

    def get_progress(self, hatm: Hatm) -> HatmProgress:
        """Получить прогресс хатма - оптимизировано с batch загрузкой пользователей"""
        # Используем joinedload для загрузки user вместе с assignment - 1 запрос вместо N+1
        assignments = (
            self.db.query(JuzAssignment)
            .options(joinedload(JuzAssignment.user))
            .filter(JuzAssignment.hatm_id == hatm.id)
            .order_by(JuzAssignment.juz_number)
            .all()
        )

        completed = sum(1 for a in assignments if a.status == JuzStatus.COMPLETED)
        pending = sum(1 for a in assignments if a.status == JuzStatus.PENDING)
        debt = sum(1 for a in assignments if a.status == JuzStatus.DEBT)

        juz_responses = []
        for a in assignments:
            # User уже загружен через joinedload - нет дополнительного запроса
            user = a.user
            juz_responses.append(JuzResponse(
                id=a.id,
                juz_number=a.juz_number,
                status=a.status,
                user_id=a.user_id,
                username=user.username if user else None,
                first_name=user.first_name if user else None,
                completed_at=a.completed_at,
                is_debt=a.is_debt
            ))

        return HatmProgress(
            total_juzs=30,
            completed_juzs=completed,
            pending_juzs=pending,
            debt_juzs=debt,
            progress_percent=round((completed / 30) * 100, 1),
            juz_assignments=juz_responses
        )

    def complete(self, hatm: Hatm) -> Hatm:
        """Завершить хатм"""
        hatm.status = HatmStatus.COMPLETED

        # Пометить непрочитанные джузы как долги
        self.db.query(JuzAssignment).filter(
            JuzAssignment.hatm_id == hatm.id,
            JuzAssignment.status == JuzStatus.PENDING
        ).update({
            JuzAssignment.status: JuzStatus.DEBT,
            JuzAssignment.is_debt: True
        })

        self.db.commit()
        self.db.refresh(hatm)
        return hatm

    def check_and_complete(self, hatm: Hatm) -> bool:
        """Проверить, все ли джузы прочитаны, и завершить хатм если да"""
        pending_count = (
            self.db.query(JuzAssignment)
            .filter(JuzAssignment.hatm_id == hatm.id, JuzAssignment.status == JuzStatus.PENDING)
            .count()
        )

        if pending_count == 0:
            hatm.status = HatmStatus.COMPLETED
            self.db.commit()
            return True
        return False

    def check_expired(self, hatm: Hatm) -> bool:
        """Проверить, истек ли срок хатма"""
        if hatm.ends_at and datetime.utcnow() > hatm.ends_at:
            self.complete(hatm)
            return True
        return False

    def force_complete(self, hatm: Hatm) -> Hatm:
        """Завершить хатм вручную (без пометки долгов)"""
        hatm.status = HatmStatus.COMPLETED
        self.db.commit()
        self.db.refresh(hatm)
        return hatm
