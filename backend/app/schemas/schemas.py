from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from app.models.models import HatmStatus, JuzStatus


# User schemas
class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Group schemas
class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class GroupJoinRequest(BaseModel):
    invite_code: str = Field(..., min_length=8, max_length=8)


class MemberResponse(BaseModel):
    id: int
    user_id: int
    username: Optional[str]
    first_name: Optional[str]
    joined_at: datetime

    class Config:
        from_attributes = True


class GroupResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    creator_id: int
    created_at: datetime
    members_count: int = 0
    has_active_hatm: bool = False

    class Config:
        from_attributes = True


class GroupDetailResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    creator_id: int
    created_at: datetime
    members: List[MemberResponse] = []
    active_hatm: Optional["HatmResponse"] = None

    class Config:
        from_attributes = True


# Hatm schemas
class HatmCreate(BaseModel):
    duration_days: int = Field(..., ge=1, le=30)
    participants_count: int = Field(..., ge=1, le=30)


class JuzResponse(BaseModel):
    id: int
    juz_number: int
    status: JuzStatus
    user_id: Optional[int] = None  # NULL = unassigned juz
    username: Optional[str] = None
    first_name: Optional[str] = None
    completed_at: Optional[datetime] = None
    is_debt: bool = False
    group_name: Optional[str] = None
    hatm_number: Optional[int] = None
    group_id: Optional[int] = None

    class Config:
        from_attributes = True


class HatmResponse(BaseModel):
    id: int
    group_id: int
    duration_days: int
    participants_count: int
    status: HatmStatus
    started_at: Optional[datetime]
    ends_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class HatmDetailResponse(BaseModel):
    id: int
    group_id: int
    duration_days: int
    participants_count: int
    status: HatmStatus
    started_at: Optional[datetime]
    ends_at: Optional[datetime]
    created_at: datetime
    juz_assignments: List[JuzResponse] = []

    class Config:
        from_attributes = True


class HatmProgress(BaseModel):
    total_juzs: int = 30
    completed_juzs: int = 0
    pending_juzs: int = 0
    debt_juzs: int = 0
    progress_percent: float = 0.0
    juz_assignments: List[JuzResponse] = []


class JuzComplete(BaseModel):
    juz_id: int


# User stats
class UserJuzStats(BaseModel):
    total_assigned: int = 0
    completed: int = 0
    pending: int = 0
    debts: int = 0
    juzs: List[JuzResponse] = []


class UserDebtResponse(BaseModel):
    debts: List[JuzResponse] = []
    total_debts: int = 0


# Rebuild models to resolve forward references
GroupDetailResponse.model_rebuild()
