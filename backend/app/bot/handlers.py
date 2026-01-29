from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
import os

from app.database import SessionLocal
from app.services import UserService, JuzService, HatmService, GroupService
from app.models.models import JuzStatus, HatmStatus

router = Router()


def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Connection will be managed by the caller


def get_webapp_url():
    return os.getenv("WEBAPP_URL", "https://your-webapp-url.com")


@router.message(Command("start"))
async def cmd_start(message: Message):
    """Обработчик команды /start"""
    db = SessionLocal()
    try:
        user_service = UserService(db)
        user = user_service.get_or_create(
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name
        )

        webapp_url = get_webapp_url()

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="📖 Открыть приложение",
                web_app=WebAppInfo(url=webapp_url)
            )],
            [InlineKeyboardButton(text="📋 Мои джузы", callback_data="my_juzs")],
            [InlineKeyboardButton(text="⚠️ Мои долги", callback_data="my_debts")]
        ])

        await message.answer(
            f"Ассаляму алейкум, {user.first_name or 'дорогой брат/сестра'}! 🌙\n\n"
            "Добро пожаловать в бот для коллективного чтения Корана (хатм).\n\n"
            "С этим ботом вы можете:\n"
            "• Создавать группы для совместного хатма\n"
            "• Распределять джузы между участниками\n"
            "• Отслеживать прогресс чтения\n"
            "• Получать напоминания о джузах\n\n"
            "Нажмите кнопку ниже, чтобы открыть приложение:",
            reply_markup=keyboard
        )
    finally:
        db.close()


@router.message(Command("myjuzs"))
async def cmd_my_juzs(message: Message):
    """Показать текущие джузы пользователя"""
    db = SessionLocal()
    try:
        user_service = UserService(db)
        juz_service = JuzService(db)

        user = user_service.get_by_telegram_id(message.from_user.id)
        if not user:
            await message.answer("Вы еще не зарегистрированы. Используйте /start")
            return

        active_juzs = juz_service.get_user_active_juzs(user)

        if not active_juzs:
            await message.answer(
                "У вас сейчас нет активных джузов для чтения.\n\n"
                "Присоединитесь к группе и дождитесь начала хатма!"
            )
            return

        text = "📖 *Ваши текущие джузы:*\n\n"

        builder = InlineKeyboardBuilder()

        for juz in active_juzs:
            text += f"• Джуз {juz.juz_number}\n"
            builder.add(InlineKeyboardButton(
                text=f"✅ Джуз {juz.juz_number} прочитан",
                callback_data=f"complete_juz:{juz.id}"
            ))

        builder.adjust(1)

        await message.answer(
            text,
            parse_mode="Markdown",
            reply_markup=builder.as_markup()
        )
    finally:
        db.close()


@router.message(Command("debts"))
async def cmd_debts(message: Message):
    """Показать долги пользователя"""
    db = SessionLocal()
    try:
        user_service = UserService(db)
        juz_service = JuzService(db)

        user = user_service.get_by_telegram_id(message.from_user.id)
        if not user:
            await message.answer("Вы еще не зарегистрированы. Используйте /start")
            return

        debts = juz_service.get_user_debts(user)

        if not debts:
            await message.answer("✨ У вас нет долгов! Машаллах!")
            return

        text = "⚠️ *Ваши долги:*\n\n"

        builder = InlineKeyboardBuilder()

        for debt in debts:
            text += f"• Джуз {debt.juz_number}\n"
            builder.add(InlineKeyboardButton(
                text=f"✅ Джуз {debt.juz_number} прочитан",
                callback_data=f"complete_juz:{debt.id}"
            ))

        builder.adjust(1)

        text += f"\nВсего долгов: {len(debts)}"

        await message.answer(
            text,
            parse_mode="Markdown",
            reply_markup=builder.as_markup()
        )
    finally:
        db.close()


@router.callback_query(F.data == "my_juzs")
async def callback_my_juzs(callback: CallbackQuery):
    """Callback для показа джузов"""
    await callback.answer()

    db = SessionLocal()
    try:
        user_service = UserService(db)
        juz_service = JuzService(db)

        user = user_service.get_by_telegram_id(callback.from_user.id)
        if not user:
            await callback.message.answer("Вы еще не зарегистрированы. Используйте /start")
            return

        active_juzs = juz_service.get_user_active_juzs(user)

        if not active_juzs:
            await callback.message.answer(
                "У вас сейчас нет активных джузов для чтения.\n\n"
                "Присоединитесь к группе и дождитесь начала хатма!"
            )
            return

        text = "📖 *Ваши текущие джузы:*\n\n"

        builder = InlineKeyboardBuilder()

        for juz in active_juzs:
            text += f"• Джуз {juz.juz_number}\n"
            builder.add(InlineKeyboardButton(
                text=f"✅ Джуз {juz.juz_number} прочитан",
                callback_data=f"complete_juz:{juz.id}"
            ))

        builder.adjust(1)

        await callback.message.answer(
            text,
            parse_mode="Markdown",
            reply_markup=builder.as_markup()
        )
    finally:
        db.close()


@router.callback_query(F.data == "my_debts")
async def callback_my_debts(callback: CallbackQuery):
    """Callback для показа долгов"""
    await callback.answer()

    db = SessionLocal()
    try:
        user_service = UserService(db)
        juz_service = JuzService(db)

        user = user_service.get_by_telegram_id(callback.from_user.id)
        if not user:
            await callback.message.answer("Вы еще не зарегистрированы. Используйте /start")
            return

        debts = juz_service.get_user_debts(user)

        if not debts:
            await callback.message.answer("✨ У вас нет долгов! Машаллах!")
            return

        text = "⚠️ *Ваши долги:*\n\n"

        builder = InlineKeyboardBuilder()

        for debt in debts:
            text += f"• Джуз {debt.juz_number}\n"
            builder.add(InlineKeyboardButton(
                text=f"✅ Джуз {debt.juz_number} прочитан",
                callback_data=f"complete_juz:{debt.id}"
            ))

        builder.adjust(1)

        text += f"\nВсего долгов: {len(debts)}"

        await callback.message.answer(
            text,
            parse_mode="Markdown",
            reply_markup=builder.as_markup()
        )
    finally:
        db.close()


@router.callback_query(F.data.startswith("complete_juz:"))
async def callback_complete_juz(callback: CallbackQuery):
    """Отметить джуз как прочитанный"""
    juz_id = int(callback.data.split(":")[1])

    db = SessionLocal()
    try:
        user_service = UserService(db)
        juz_service = JuzService(db)
        hatm_service = HatmService(db)

        user = user_service.get_by_telegram_id(callback.from_user.id)
        if not user:
            await callback.answer("Ошибка авторизации", show_alert=True)
            return

        juz = juz_service.get_by_id(juz_id)
        if not juz:
            await callback.answer("Джуз не найден", show_alert=True)
            return

        if juz.user_id != user.id:
            await callback.answer("Это не ваш джуз", show_alert=True)
            return

        if juz.status == JuzStatus.COMPLETED:
            await callback.answer("Джуз уже отмечен как прочитанный", show_alert=True)
            return

        juz = juz_service.mark_completed(juz)

        # Проверяем, завершен ли хатм
        hatm = hatm_service.get_by_id(juz.hatm_id)
        hatm_completed = False
        if hatm:
            hatm_completed = hatm_service.check_and_complete(hatm)

        await callback.answer("Джуз отмечен как прочитанный! Баракаллаху фикум! 🤲", show_alert=True)

        # Обновляем сообщение
        await callback.message.edit_text(
            f"✅ Джуз {juz.juz_number} отмечен как прочитанный!\n\n"
            f"{'🎉 Хатм завершен! Аллахумма баракалана!' if hatm_completed else 'Продолжайте в том же духе!'}"
        )
    finally:
        db.close()
