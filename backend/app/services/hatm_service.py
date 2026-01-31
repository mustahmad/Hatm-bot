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
        """
        Запустить хатм и распределить джузы.
        Распределение происходит инкрементально:
        - participants_count определяет сколько джузов на человека (30 / participants_count)
        - Текущие участники сразу получают свои джузы
        - Остальные джузы остаются нераспределёнными (user_id = NULL)
        - По мере вступления новых людей им назначаются джузы из нераспределённых
        """
        if hatm.status != HatmStatus.PENDING:
            raise ValueError("Хатм уже запущен или завершен")

        # Установить время начала и окончания
        hatm.started_at = datetime.utcnow()
        hatm.ends_at = hatm.started_at + timedelta(days=hatm.duration_days)
        hatm.status = HatmStatus.ACTIVE

        # Распределить 30 джузов (часть назначена текущим участникам, часть без назначения)
        self._distribute_juzs_incremental(hatm, participants)

        self.db.commit()
        self.db.refresh(hatm)
        return hatm

    def _distribute_juzs_incremental(self, hatm: Hatm, current_participants: List[User]):
        """
        Инкрементальное распределение 30 джузов.
        - participants_count (из hatm) определяет количество джузов на человека
        - Текущие участники получают свои порции
        - Остальные джузы создаются с user_id = NULL
        """
        total_juzs = 30
        target_participants = hatm.participants_count  # Целевое количество участников

        # Создаём список всех джузов и перемешиваем
        juz_numbers = list(range(1, total_juzs + 1))
        random.shuffle(juz_numbers)

        # Базовое количество джузов на участника
        base_juzs = total_juzs // target_participants
        # Остаток, который нужно распределить
        remainder = total_juzs % target_participants

        # Сколько участников уже есть
        current_count = min(len(current_participants), target_participants)

        juz_index = 0

        # Раздаём джузы текущим участникам
        for i in range(current_count):
            user = current_participants[i]
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

        # Создаём нераспределённые джузы (user_id = NULL) для оставшихся слотов
        for i in range(current_count, target_participants):
            juzs_for_slot = base_juzs + (1 if i < remainder else 0)

            for _ in range(juzs_for_slot):
                assignment = JuzAssignment(
                    hatm_id=hatm.id,
                    user_id=None,  # Нераспределённый джуз
                    juz_number=juz_numbers[juz_index],
                    status=JuzStatus.PENDING
                )
                self.db.add(assignment)
                juz_index += 1

    def get_juzs_per_participant(self, hatm: Hatm) -> int:
        """Получить количество джузов на одного участника"""
        return 30 // hatm.participants_count

    def get_assigned_participants_count(self, hatm: Hatm) -> int:
        """Получить количество участников, которым уже назначены джузы"""
        result = (
            self.db.query(JuzAssignment.user_id)
            .filter(JuzAssignment.hatm_id == hatm.id, JuzAssignment.user_id.isnot(None))
            .distinct()
            .count()
        )
        return result

    def assign_juzs_to_new_member(self, hatm: Hatm, user: User) -> List[JuzAssignment]:
        """
        Назначить джузы новому участнику из нераспределённого пула.
        Возвращает список назначенных джузов или пустой список если мест нет.
        """
        if hatm.status != HatmStatus.ACTIVE:
            return []

        # Проверяем, не назначены ли уже джузы этому пользователю в этом хатме
        existing = (
            self.db.query(JuzAssignment)
            .filter(JuzAssignment.hatm_id == hatm.id, JuzAssignment.user_id == user.id)
            .first()
        )
        if existing:
            return []  # У пользователя уже есть джузы

        # Проверяем, есть ли свободные слоты
        assigned_count = self.get_assigned_participants_count(hatm)
        if assigned_count >= hatm.participants_count:
            return []  # Все слоты заняты

        # Определяем сколько джузов нужно назначить
        base_juzs = 30 // hatm.participants_count
        remainder = 30 % hatm.participants_count
        # Новый участник получает столько джузов, сколько положено для его "слота"
        juzs_for_user = base_juzs + (1 if assigned_count < remainder else 0)

        # Берём нераспределённые джузы
        unassigned_juzs = (
            self.db.query(JuzAssignment)
            .filter(JuzAssignment.hatm_id == hatm.id, JuzAssignment.user_id.is_(None))
            .limit(juzs_for_user)
            .all()
        )

        if len(unassigned_juzs) == 0:
            return []

        # Назначаем джузы пользователю
        for juz in unassigned_juzs:
            juz.user_id = user.id

        self.db.commit()
        return unassigned_juzs

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
