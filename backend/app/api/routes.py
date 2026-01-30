from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.api.deps import (
    get_current_user,
    get_group_service,
    get_hatm_service,
    get_juz_service,
    get_user_service,
    get_notification_service
)
from app.models.models import User, HatmStatus, JuzAssignment
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


@router.delete("/groups/{group_id}/leave")
async def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    db: Session = Depends(get_db)
):
    """Покинуть группу"""
    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=400, detail="Вы не являетесь участником группы")

    # Проверяем, есть ли активный хатм
    if group_service.has_active_hatm(group):
        raise HTTPException(
            status_code=400,
            detail="Нельзя покинуть группу с активным хатмом"
        )

    # Если это создатель — удаляем всю группу
    if group.creator_id == current_user.id:
        db.delete(group)
        db.commit()
        return {"message": "Группа удалена"}

    group_service.remove_member(group, current_user)
    return {"message": "Вы покинули группу"}


# ============== Hatm Routes ==============

@router.post("/groups/{group_id}/hatms", response_model=HatmResponse)
async def create_hatm(
    group_id: int,
    hatm_data: HatmCreate,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
    hatm_service: HatmService = Depends(get_hatm_service),
    db: Session = Depends(get_db)
):
    """Создать новый хатм в группе"""
    import asyncio

    group = group_service.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    if not group_service.is_member(group, current_user):
        raise HTTPException(status_code=403, detail="Вы не являетесь участником группы")

    if group_service.has_active_hatm(group):
        raise HTTPException(status_code=400, detail="В группе уже есть активный хатм")

    hatm = hatm_service.create(group, hatm_data)

    # Собираем данные до закрытия сессии
    members = group_service.get_members(group)
    juz_assignments = db.query(JuzAssignment).filter(JuzAssignment.hatm_id == hatm.id).all()

    # Группируем джузы по пользователям
    user_juzs = {}
    for juz in juz_assignments:
        if juz.user_id not in user_juzs:
            user_juzs[juz.user_id] = []
        user_juzs[juz.user_id].append(juz)

    # Сохраняем данные для уведомлений
    notification_data = []
    for member in members:
        if member.id in user_juzs and member.telegram_id:
            notification_data.append({
                'telegram_id': member.telegram_id,
                'first_name': member.first_name,
                'juz_numbers': sorted([j.juz_number for j in user_juzs[member.id]]),
                'group_name': group.name,
                'duration_days': hatm.duration_days
            })

    # Отправляем уведомления асинхронно
    async def send_notifications():
        notification_service = get_notification_service()
        if notification_service and notification_service.bot:
            for data in notification_data:
                try:
                    juz_list = ", ".join(str(n) for n in data['juz_numbers'])
                    text = (
                        f"📖 *Новый хатм начат!*\n\n"
                        f"Группа: {data['group_name']}\n"
                        f"Срок: {data['duration_days']} дн.\n\n"
                        f"Вам назначены джузы: *{juz_list}*\n\n"
                        f"Да поможет вам Аллах в чтении Корана! 🤲"
                    )
                    await notification_service.bot.send_message(
                        chat_id=data['telegram_id'],
                        text=text,
                        parse_mode="Markdown"
                    )
                except Exception as e:
                    import logging
                    logging.error(f"Failed to send notification to {data['telegram_id']}: {e}")

    # Запускаем отправку уведомлений в фоне
    asyncio.create_task(send_notifications())

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
    import asyncio

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

    # Собираем данные для уведомлений до закрытия сессии
    user_juzs = {}
    for assignment in db.query(JuzAssignment).filter(JuzAssignment.hatm_id == hatm.id).all():
        if assignment.user_id not in user_juzs:
            user_juzs[assignment.user_id] = []
        user_juzs[assignment.user_id].append(assignment)

    notification_data = []
    for user in participants:
        if user.id in user_juzs and user.telegram_id:
            notification_data.append({
                'telegram_id': user.telegram_id,
                'juz_numbers': sorted([j.juz_number for j in user_juzs[user.id]]),
                'group_name': group.name,
                'duration_days': hatm.duration_days
            })

    # Отправляем уведомления асинхронно
    async def send_start_notifications():
        notification_service = get_notification_service()
        if notification_service and notification_service.bot:
            for data in notification_data:
                try:
                    juz_list = ", ".join(str(n) for n in data['juz_numbers'])
                    text = (
                        f"📖 *Хатм начат!*\n\n"
                        f"Группа: {data['group_name']}\n"
                        f"Срок: {data['duration_days']} дн.\n\n"
                        f"Вам назначены джузы: *{juz_list}*\n\n"
                        f"Да поможет вам Аллах в чтении Корана! 🤲"
                    )
                    await notification_service.bot.send_message(
                        chat_id=data['telegram_id'],
                        text=text,
                        parse_mode="Markdown"
                    )
                except Exception as e:
                    import logging
                    logging.error(f"Failed to send start notification to {data['telegram_id']}: {e}")

    asyncio.create_task(send_start_notifications())

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
    hatm_service: HatmService = Depends(get_hatm_service),
    db: Session = Depends(get_db)
):
    """Завершить хатм вручную"""
    import asyncio

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

    # Собираем данные до закрытия сессии
    participant_ids = db.query(JuzAssignment.user_id).filter(
        JuzAssignment.hatm_id == hatm.id
    ).distinct().all()

    from app.models.models import User as UserModel
    notification_data = []
    for (user_id,) in participant_ids:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user and user.telegram_id:
            notification_data.append({
                'telegram_id': user.telegram_id,
                'group_name': group.name if group else 'группы'
            })

    # Отправляем уведомления асинхронно
    async def send_completion_notifications():
        notification_service = get_notification_service()
        if notification_service and notification_service.bot:
            for data in notification_data:
                try:
                    text = (
                        f"🎉 *Хатм завершен!*\n\n"
                        f"Группа: {data['group_name']}\n\n"
                        f"Аллахумма баракалана! Хатм группы успешно завершен!\n"
                        f"Баракаллаху фикум всем участникам! 🤲"
                    )
                    await notification_service.bot.send_message(
                        chat_id=data['telegram_id'],
                        text=text,
                        parse_mode="Markdown"
                    )
                except Exception as e:
                    import logging
                    logging.error(f"Failed to send completion notification to {data['telegram_id']}: {e}")

    asyncio.create_task(send_completion_notifications())

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
    hatm_service: HatmService = Depends(get_hatm_service),
    group_service: GroupService = Depends(get_group_service),
    db: Session = Depends(get_db)
):
    """Отметить джуз как прочитанный"""
    import asyncio

    juz = juz_service.get_by_id(juz_id)
    if not juz:
        raise HTTPException(status_code=404, detail="Джуз не найден")

    if juz.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваш джуз")

    juz = juz_service.mark_completed(juz)

    # Проверяем, завершен ли хатм
    hatm = hatm_service.get_by_id(juz.hatm_id)
    if hatm:
        was_completed = hatm_service.check_and_complete(hatm)

        # Если хатм был завершен, отправляем уведомления
        if was_completed:
            group = group_service.get_by_id(hatm.group_id)

            # Собираем данные до закрытия сессии
            participant_ids = db.query(JuzAssignment.user_id).filter(
                JuzAssignment.hatm_id == hatm.id
            ).distinct().all()

            from app.models.models import User as UserModel
            notification_data = []
            for (user_id,) in participant_ids:
                user = db.query(UserModel).filter(UserModel.id == user_id).first()
                if user and user.telegram_id:
                    notification_data.append({
                        'telegram_id': user.telegram_id,
                        'group_name': group.name if group else 'группы'
                    })

            # Отправляем уведомления асинхронно
            async def send_completion_notifications():
                notification_service = get_notification_service()
                if notification_service and notification_service.bot:
                    for data in notification_data:
                        try:
                            text = (
                                f"🎉 *Хатм завершен!*\n\n"
                                f"Группа: {data['group_name']}\n\n"
                                f"Аллахумма баракалана! Хатм группы успешно завершен!\n"
                                f"Баракаллаху фикум всем участникам! 🤲"
                            )
                            await notification_service.bot.send_message(
                                chat_id=data['telegram_id'],
                                text=text,
                                parse_mode="Markdown"
                            )
                        except Exception as e:
                            import logging
                            logging.error(f"Failed to send completion notification to {data['telegram_id']}: {e}")

            asyncio.create_task(send_completion_notifications())

    return juz_service.get_juz_with_user_info(juz)
