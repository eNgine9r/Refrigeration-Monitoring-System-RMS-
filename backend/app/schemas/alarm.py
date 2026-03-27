from datetime import datetime

from pydantic import BaseModel

from app.models.enums import AlarmStatus, AlarmType


class AlarmRead(BaseModel):
    id: int
    device_id: int
    alarm_type: AlarmType
    status: AlarmStatus
    severity: int
    message: str
    details: str | None
    started_at: datetime
    updated_at: datetime
    resolved_at: datetime | None

    model_config = {'from_attributes': True}
