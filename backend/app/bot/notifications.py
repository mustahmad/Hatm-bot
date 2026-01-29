from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from typing import List
import logging

from app.models.models import User, JuzAssignment, Hatm, Group

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, bot: Bot):
        self.bot = bot

    async def notify_juz_assigned(self, user: User, juz_assignments: List[JuzAssignment], hatm: Hatm, group: Group):
        """Уведомить пользователя о назначенных джузах"""
        try:
            juz_numbers = sorted([j.juz_number for j in juz_assignments])
            juz_list = ", ".join(str(n) for n in juz_numbers)

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="📋 Мои джузы",
                    callback_data="my_juzs"
                )]
            ])

            text = (
                f"📖 *Новый хатм начат!*\n\n"
                f"Группа: {group.name}\n"
                f"Срок: {hatm.duration_days} дн.\n\n"
                f"Вам назначены джузы: *{juz_list}*\n\n"
                f"Да поможет вам Аллах в чтении Корана! 🤲"
            )

            await self.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                parse_mode="Markdown",
                reply_markup=keyboard
            )
        except Exception as e:
            logger.error(f"Failed to send notification to user {user.telegram_id}: {e}")

    async def notify_hatm_completed(self, user: User, hatm: Hatm, group: Group):
        """Уведомить пользователя о завершении хатма"""
        try:
            text = (
                f"🎉 *Хатм завершен!*\n\n"
                f"Группа: {group.name}\n\n"
                f"Аллахумма баракалана! Хатм группы успешно завершен!\n"
                f"Баракаллаху фикум всем участникам! 🤲"
            )

            await self.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Failed to send completion notification to user {user.telegram_id}: {e}")

    async def notify_reminder(self, user: User, juz_assignments: List[JuzAssignment], hatm: Hatm, days_left: int):
        """Напоминание о непрочитанных джузах"""
        try:
            juz_numbers = sorted([j.juz_number for j in juz_assignments])
            juz_list = ", ".join(str(n) for n in juz_numbers)

            keyboard = InlineKeyboardMarkup(inline_keyboard=[])

            for juz in juz_assignments:
                keyboard.inline_keyboard.append([
                    InlineKeyboardButton(
                        text=f"✅ Джуз {juz.juz_number} прочитан",
                        callback_data=f"complete_juz:{juz.id}"
                    )
                ])

            text = (
                f"⏰ *Напоминание*\n\n"
                f"До окончания хатма осталось: {days_left} дн.\n\n"
                f"У вас есть непрочитанные джузы: *{juz_list}*\n\n"
                f"Не забудьте прочитать их вовремя! 📖"
            )

            await self.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                parse_mode="Markdown",
                reply_markup=keyboard
            )
        except Exception as e:
            logger.error(f"Failed to send reminder to user {user.telegram_id}: {e}")

    async def notify_debt_created(self, user: User, juz_assignments: List[JuzAssignment]):
        """Уведомить пользователя о появлении долгов"""
        try:
            juz_numbers = sorted([j.juz_number for j in juz_assignments])
            juz_list = ", ".join(str(n) for n in juz_numbers)

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="⚠️ Мои долги",
                    callback_data="my_debts"
                )]
            ])

            text = (
                f"⚠️ *У вас появились долги*\n\n"
                f"Хатм завершился, но у вас остались непрочитанные джузы: *{juz_list}*\n\n"
                f"Вы можете закрыть их в любое время. 📖"
            )

            await self.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                parse_mode="Markdown",
                reply_markup=keyboard
            )
        except Exception as e:
            logger.error(f"Failed to send debt notification to user {user.telegram_id}: {e}")
