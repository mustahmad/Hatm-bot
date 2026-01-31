from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey, Enum, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class HatmStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"


class JuzStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    DEBT = "debt"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    created_groups = relationship("Group", back_populates="creator")
    group_memberships = relationship("GroupMember", back_populates="user")
    juz_assignments = relationship("JuzAssignment", back_populates="user")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    invite_code = Column(String(8), unique=True, index=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    hatms = relationship("Hatm", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        Index('idx_group_member_group_user', 'group_id', 'user_id'),
    )

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")


class Hatm(Base):
    __tablename__ = "hatms"
    __table_args__ = (
        Index('idx_hatm_group_status', 'group_id', 'status'),
    )

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
    duration_days = Column(Integer, nullable=False)
    participants_count = Column(Integer, nullable=False)
    status = Column(Enum(HatmStatus), default=HatmStatus.PENDING, index=True)
    started_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    group = relationship("Group", back_populates="hatms")
    juz_assignments = relationship("JuzAssignment", back_populates="hatm", cascade="all, delete-orphan")


class JuzAssignment(Base):
    __tablename__ = "juz_assignments"
    __table_args__ = (
        Index('idx_juz_hatm_user', 'hatm_id', 'user_id'),
        Index('idx_juz_user_status', 'user_id', 'status'),
    )

    id = Column(Integer, primary_key=True, index=True)
    hatm_id = Column(Integer, ForeignKey("hatms.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # NULL = unassigned
    juz_number = Column(Integer, nullable=False)  # 1-30
    status = Column(Enum(JuzStatus), default=JuzStatus.PENDING, index=True)
    completed_at = Column(DateTime, nullable=True)
    is_debt = Column(Boolean, default=False, index=True)

    # Relationships
    hatm = relationship("Hatm", back_populates="juz_assignments")
    user = relationship("User", back_populates="juz_assignments")
