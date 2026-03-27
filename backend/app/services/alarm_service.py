import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.alarm import Alarm
from app.models.device import Device
from app.models.enums import AlarmStatus, AlarmType

logger = logging.getLogger(__name__)


class AlarmService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def evaluate_device(self, session: AsyncSession, device: Device, values: dict[str, float | int | bool]) -> None:
        temperature = values.get('temperature')
        if isinstance(temperature, (float, int)):
            if device.high_temp_threshold is not None and temperature > device.high_temp_threshold:
                await self._activate_alarm(session, device.id, AlarmType.high_temp, f'Temperature too high: {temperature}')
            else:
                await self._resolve_alarm(session, device.id, AlarmType.high_temp)

            if device.low_temp_threshold is not None and temperature < device.low_temp_threshold:
                await self._activate_alarm(session, device.id, AlarmType.low_temp, f'Temperature too low: {temperature}')
            else:
                await self._resolve_alarm(session, device.id, AlarmType.low_temp)

    async def device_offline(self, session: AsyncSession, device: Device, details: str) -> None:
        await self._activate_alarm(session, device.id, AlarmType.device_offline, details)

    async def _activate_alarm(self, session: AsyncSession, device_id: int, alarm_type: AlarmType, message: str) -> None:
        query = select(Alarm).where(
            and_(Alarm.device_id == device_id, Alarm.alarm_type == alarm_type, Alarm.status == AlarmStatus.active)
        )
        alarm = (await session.execute(query)).scalar_one_or_none()
        if alarm:
            return

        alarm = Alarm(device_id=device_id, alarm_type=alarm_type, status=AlarmStatus.active, message=message)
        session.add(alarm)
        await session.flush()
        logger.warning('Alarm created: device=%s type=%s message=%s', device_id, alarm_type.value, message)

    async def _resolve_alarm(self, session: AsyncSession, device_id: int, alarm_type: AlarmType) -> None:
        query = select(Alarm).where(
            and_(Alarm.device_id == device_id, Alarm.alarm_type == alarm_type, Alarm.status == AlarmStatus.active)
        )
        alarm = (await session.execute(query)).scalar_one_or_none()
        if not alarm:
            return

        alarm.status = AlarmStatus.resolved
        alarm.resolved_at = datetime.now(timezone.utc)
        await session.flush()

    async def send_webhook(self, webhook_url: str, payload: dict) -> None:
        try:
            async with httpx.AsyncClient(timeout=self.settings.webhook_timeout_seconds) as client:
                await client.post(webhook_url, json=payload)
        except Exception as exc:
            logger.error('Webhook notification failed: %s', exc)
