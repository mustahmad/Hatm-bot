from sqlalchemy.orm import Session
from typing import List, Optional
import secrets
import string

from app.models.models import Group, GroupMember, User, Hatm, HatmStatus
from app.schemas.schemas import GroupCreate


class GroupService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_invite_code(self) -> str:
        """Генерация уникального 8-символьного кода приглашения"""
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(chars) for _ in range(8))
            if not self.db.query(Group).filter(Group.invite_code == code).first():
                return code

    def create(self, user: User, group_data: GroupCreate) -> Group:
        """Создать новую группу"""
        group = Group(
            name=group_data.name,
            invite_code=self._generate_invite_code(),
            creator_id=user.id
        )
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)

        # Автоматически добавить создателя в группу
        self.add_member(group, user)
        return group

    def get_by_id(self, group_id: int) -> Optional[Group]:
        """Получить группу по ID"""
        return self.db.query(Group).filter(Group.id == group_id).first()

    def get_by_invite_code(self, invite_code: str) -> Optional[Group]:
        """Получить группу по коду приглашения"""
        return self.db.query(Group).filter(Group.invite_code == invite_code.upper()).first()

    def get_user_groups(self, user: User) -> List[Group]:
        """Получить все группы пользователя"""
        return (
            self.db.query(Group)
            .join(GroupMember)
            .filter(GroupMember.user_id == user.id)
            .all()
        )

    def add_member(self, group: Group, user: User) -> GroupMember:
        """Добавить участника в группу"""
        # Проверяем, не является ли уже участником
        existing = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group.id, GroupMember.user_id == user.id)
            .first()
        )
        if existing:
            return existing

        member = GroupMember(group_id=group.id, user_id=user.id)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def remove_member(self, group: Group, user: User) -> bool:
        """Удалить участника из группы"""
        member = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group.id, GroupMember.user_id == user.id)
            .first()
        )
        if member:
            self.db.delete(member)
            self.db.commit()
            return True
        return False

    def is_member(self, group: Group, user: User) -> bool:
        """Проверить, является ли пользователь участником группы"""
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group.id, GroupMember.user_id == user.id)
            .first()
        ) is not None

    def get_members(self, group: Group) -> List[GroupMember]:
        """Получить всех участников группы"""
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group.id)
            .all()
        )

    def get_members_count(self, group: Group) -> int:
        """Получить количество участников группы"""
        return self.db.query(GroupMember).filter(GroupMember.group_id == group.id).count()

    def has_active_hatm(self, group: Group) -> bool:
        """Проверить, есть ли активный хатм в группе"""
        return (
            self.db.query(Hatm)
            .filter(Hatm.group_id == group.id, Hatm.status == HatmStatus.ACTIVE)
            .first()
        ) is not None

    def get_active_hatm(self, group: Group) -> Optional[Hatm]:
        """Получить активный хатм группы"""
        return (
            self.db.query(Hatm)
            .filter(Hatm.group_id == group.id, Hatm.status == HatmStatus.ACTIVE)
            .first()
        )
