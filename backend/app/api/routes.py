from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.api.deps import (
    get_current_user,
    get_group_service,
    get_hatm_service,
    get_juz_service,
    get_user_service
)
from app.models.models import User, HatmStatus
from app.schemas.schemas import (
    GroupCreate, GroupResponse, GroupDetailResponse, GroupJoinRequest,
    HatmCreate, HatmResponse, HatmDetailResponse, HatmProgress,
    JuzResponse, UserJuzStats, UserDebtResponse, MemberResponse
)
from app.services import GroupService, HatmService, JuzService, UserService

router = APIRouter()


# ============== User Routes ==============

@router.get("/users/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "username": current_user.username,
        "first_name": current_user.first_name
    }


@router.get("/users/me/juzs", response_model=UserJuzStats)
async def get_my_juzs(
    current_user: User = Depends(get_current_user),
    juz_service: JuzService = Depends(get_juz_service)
):
    """Получить все джузы текущего пользователя"""
    return juz_service.get_user_stats(current_user)


@router.get("/users/me/debts", response_model=UserDebtResponse)
async def get_my_debts(
    current_user: User = Depends(get_current_user),
    juz_service: JuzService = Depends(get_juz_service)
):
    """Получить долги текущего пользователя"""
    return juz_service.get_user_debt_response(current_user)


# ============== Group Routes ==============

@router.post("/groups", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service)
):
    """Создать новую группу"""
    group = group_service.create(current_user, group_data)
    return GroupResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code,
        creator_id=group.creator_id,
        created_at=group.created_at,
        members_count=group_service.get_members_count(group),
        has_active_hatm=group_service.has_active_hatm(group)
    )


@router.get("/groups", response_model=List[GroupResponse])
async def get_my_groups(
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service)
):
    """Получить список групп пользователя"""
    groups = group_service.get_user_groups(current_user)
    return [
        GroupResponse(
            id=g.id,
            name=g.name,
            invite_code=g.invite_code,
            creator_id=g.creator_id,
            created_at=g.created_at,
            members_count=group_service.get_members_count(g),
            has_active_hatm=group_service.has_active_hatm(g)
        )
        for g in groups
    ]


@router.get("/groups/{group_id}", response_model=GroupDetailResponse)
async def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service),
    db: Session = Depends(get_db)
):
    """Получить информацию о группе"""
    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    members = group_service.get_members(group)
    member_responses = []
    for m in members:
        member_responses.append(MemberResponse(
            id=m.id,
            user_id=m.user.id,
            username=m.user.username,
            first_name=m.user.first_name,
            joined_at=m.joined_at
        ))

    active_hatm = group_service.get_active_hatm(group)
    active_hatm_response = None
    if active_hatm:
        active_hatm_response = HatmResponse(
            id=active_hatm.id,
            group_id=active_hatm.group_id,
            duration_days=active_hatm.duration_days,
            participants_count=active_hatm.participants_count,
            status=active_hatm.status,
            started_at=active_hatm.started_at,
            ends_at=active_hatm.ends_at,
            created_at=active_hatm.created_at
        )

    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code,
        creator_id=group.creator_id,
        created_at=group.created_at,
        members=member_responses,
        active_hatm=active_hatm_response
    )


@router.post("/groups/join", response_model=GroupResponse)
async def join_group(
    join_data: GroupJoinRequest,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service)
):
    """Вступить в группу по коду приглашения"""
    group = group_service.get_by_invite_code(join_data.invite_code)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    group_service.add_member(group, current_user)

    return GroupResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code,
        creator_id=group.creator_id,
        created_at=group.created_at,
        members_count=group_service.get_members_count(group),
        has_active_hatm=group_service.has_active_hatm(group)
    )


@router.get("/groups/{group_id}/members", response_model=List[MemberResponse])
async def get_group_members(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service)
):
    """Получить список участников группы"""
    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    members = group_service.get_members(group)
    return [
        MemberResponse(
            id=m.id,
            user_id=m.user.id,
            username=m.user.username,
            first_name=m.user.first_name,
            joined_at=m.joined_at
        )
        for m in members
    ]


# ============== Hatm Routes ==============

@router.post("/groups/{group_id}/hatms", response_model=HatmResponse)
async def create_hatm(
    group_id: int,
    hatm_data: HatmCreate,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Создать новый хатм в группе"""
    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    if group_service.has_active_hatm(group):
        raise HTTPException(status_code=400, detail="В группе уже есть активный хатм")

    hatm = hatm_service.create(group, hatm_data)
    return HatmResponse(
        id=hatm.id,
        group_id=hatm.group_id,
        duration_days=hatm.duration_days,
        participants_count=hatm.participants_count,
        status=hatm.status,
        started_at=hatm.started_at,
        ends_at=hatm.ends_at,
        created_at=hatm.created_at
    )


@router.get("/groups/{group_id}/hatms", response_model=List[HatmResponse])
async def get_group_hatms(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Получить список хатмов группы"""
    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    hatms = hatm_service.get_group_hatms(group)
    return [
        HatmResponse(
            id=h.id,
            group_id=h.group_id,
            duration_days=h.duration_days,
            participants_count=h.participants_count,
            status=h.status,
            started_at=h.started_at,
            ends_at=h.ends_at,
            created_at=h.created_at
        )
        for h in hatms
    ]


@router.get("/hatms/{hatm_id}", response_model=HatmDetailResponse)
async def get_hatm(
    hatm_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Получить информацию о хатме"""
    hatm = hatm_service.get_by_id(hatm_id)
    if not hatm:
        raise HTTPException(status_code=404, detail="Хатм не найден")

    group = group_service.get_by_id(hatm.group_id)
    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    progress = hatm_service.get_progress(hatm)

    return HatmDetailResponse(
        id=hatm.id,
        group_id=hatm.group_id,
        duration_days=hatm.duration_days,
        participants_count=hatm.participants_count,
        status=hatm.status,
        started_at=hatm.started_at,
        ends_at=hatm.ends_at,
        created_at=hatm.created_at,
        juz_assignments=progress.juz_assignments
    )


@router.post("/hatms/{hatm_id}/start", response_model=HatmResponse)
async def start_hatm(
    hatm_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service),
    db: Session = Depends(get_db)
):
    """Запустить хатм (распределить джузы)"""
    hatm = hatm_service.get_by_id(hatm_id)
    if not hatm:
        raise HTTPException(status_code=404, detail="Хатм не найден")

    group = group_service.get_by_id(hatm.group_id)
    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    if hatm.status != HatmStatus.PENDING:
        raise HTTPException(status_code=400, detail="Хатм уже запущен или завершен")

    # Получаем участников группы
    members = group_service.get_members(group)
    participants = [m.user for m in members]

    if len(participants) == 0:
        raise HTTPException(status_code=400, detail="В группе нет участников")

    # Ограничиваем количество участников, если указано
    if hatm.participants_count < len(participants):
        participants = participants[:hatm.participants_count]

    hatm = hatm_service.start(hatm, participants)

    return HatmResponse(
        id=hatm.id,
        group_id=hatm.group_id,
        duration_days=hatm.duration_days,
        participants_count=hatm.participants_count,
        status=hatm.status,
        started_at=hatm.started_at,
        ends_at=hatm.ends_at,
        created_at=hatm.created_at
    )


@router.get("/hatms/{hatm_id}/progress", response_model=HatmProgress)
async def get_hatm_progress(
    hatm_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Получить прогресс хатма"""
    hatm = hatm_service.get_by_id(hatm_id)
    if not hatm:
        raise HTTPException(status_code=404, detail="Хатм не найден")

    group = group_service.get_by_id(hatm.group_id)
    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    return hatm_service.get_progress(hatm)


@router.post("/hatms/{hatm_id}/complete", response_model=HatmResponse)
async def complete_hatm(
    hatm_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Завершить хатм вручную"""
    hatm = hatm_service.get_by_id(hatm_id)
    if not hatm:
        raise HTTPException(status_code=404, detail="Хатм не найден")

    group = group_service.get_by_id(hatm.group_id)
    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    if hatm.status == HatmStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Хатм уже завершен")

    if hatm.status == HatmStatus.PENDING:
        raise HTTPException(status_code=400, detail="Хатм еще не начат")

    hatm = hatm_service.force_complete(hatm)

    return HatmResponse(
        id=hatm.id,
        group_id=hatm.group_id,
        duration_days=hatm.duration_days,
        participants_count=hatm.participants_count,
        status=hatm.status,
        started_at=hatm.started_at,
        ends_at=hatm.ends_at,
        created_at=hatm.created_at
    )


# ============== Juz Routes ==============

@router.post("/juzs/{juz_id}/complete", response_model=JuzResponse)
async def complete_juz(
    juz_id: int,
    current_user: User = Depends(get_current_user),
    juz_service: JuzService = Depends(get_juz_service),
    hatm_service: HatmService = Depends(get_hatm_service)
):
    """Отметить джуз как прочитанный"""
    juz = juz_service.get_by_id(juz_id)
    if not juz:
        raise HTTPException(status_code=404, detail="Джуз не найден")

    if juz.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваш джуз")

    juz = juz_service.mark_completed(juz)

    # Проверяем, завершен ли хатм
    hatm = hatm_service.get_by_id(juz.hatm_id)
    if hatm:
        hatm_service.check_and_complete(hatm)

    return juz_service.get_juz_with_user_info(juz)
