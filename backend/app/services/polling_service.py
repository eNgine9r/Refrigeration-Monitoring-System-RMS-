import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models.device import Device
from app.services.alarm_service import AlarmService
from app.services.influx_service import InfluxService
from app.services.modbus_service import ModbusService

logger = logging.getLogger(__name__)


class PollingService:
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        modbus_service: ModbusService,
        influx_service: InfluxService,
        alarm_service: AlarmService,
    ) -> None:
        self.session_factory = session_factory
        self.modbus_service = modbus_service
        self.influx_service = influx_service
        self.alarm_service = alarm_service
        self._tasks: list[asyncio.Task[Any]] = []
        self._stop_event = asyncio.Event()

    async def start(self) -> None:
        self._stop_event.clear()
        async with self.session_factory() as session:
            devices = (await session.execute(select(Device))).scalars().all()

        for device in devices:
            task = asyncio.create_task(self._poll_device_loop(device.id), name=f'poll-device-{device.id}')
            self._tasks.append(task)

    async def stop(self) -> None:
        self._stop_event.set()
        for task in self._tasks:
            task.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()
        await self.modbus_service.close_all()

    async def _poll_device_loop(self, device_id: int) -> None:
        while not self._stop_event.is_set():
            async with self.session_factory() as session:
                device = await session.get(Device, device_id)
                if not device:
                    return
                try:
                    values = await self.poll_device(device)
                    device.latest_values = values
                    device.last_seen_at = datetime.now(timezone.utc)
                    await self.alarm_service.evaluate_device(session, device, values)
                    await session.commit()
                except Exception as exc:
                    logger.exception('Polling failed for device %s: %s', device.id, exc)
                    await self.alarm_service.device_offline(session, device, str(exc))
                    await session.commit()

                await asyncio.sleep(max(1, min(60, device.polling_interval_sec)))

    async def poll_device(self, device: Device) -> dict[str, Any]:
        values: dict[str, Any] = {}
        for key, reg in device.register_map.items():
            reg_type = reg.get('type', 'holding')
            address = int(reg['address'])
            scale = float(reg.get('scale', 1.0))

            if reg_type == 'holding':
                raw = (await self.modbus_service.read_holding_registers(device, address=address, count=1))[0]
                values[key] = raw * scale
            elif reg_type == 'coil':
                raw_coil = (await self.modbus_service.read_coils(device, address=address, count=1))[0]
                values[key] = bool(raw_coil)
            else:
                raise ValueError(f'Unsupported register type: {reg_type}')

        numeric_fields = {k: float(v) for k, v in values.items() if isinstance(v, (float, int))}
        if numeric_fields:
            self.influx_service.write_temperature(device.id, numeric_fields)

        return values
