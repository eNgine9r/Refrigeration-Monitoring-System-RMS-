from app.core.database import SessionLocal
from app.services.alarm_service import AlarmService
from app.services.influx_service import InfluxService
from app.services.modbus_service import ModbusService
from app.services.polling_service import PollingService


class PollingWorker:
    def __init__(self) -> None:
        self.service = PollingService(
            session_factory=SessionLocal,
            modbus_service=ModbusService(),
            influx_service=InfluxService(),
            alarm_service=AlarmService(),
        )

    async def start(self) -> None:
        await self.service.start()

    async def stop(self) -> None:
        await self.service.stop()
