from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DeviceBase(BaseModel):
    name: str
    protocol: str = Field(default='rtu', pattern='^(rtu|tcp)$')
    host: str | None = None
    port: int | None = None
    serial_port: str | None = None
    baudrate: int = 9600
    modbus_address: int
    polling_interval_sec: int = Field(default=10, ge=1, le=60)
    register_map: dict[str, dict[str, Any]]
    high_temp_threshold: float | None = None
    low_temp_threshold: float | None = None


class DeviceCreate(DeviceBase):
    pass


class DeviceRead(DeviceBase):
    id: int
    latest_values: dict[str, Any] | None = None
    last_seen_at: datetime | None = None

    model_config = {'from_attributes': True}


class DeviceWriteRequest(BaseModel):
    register: int
    value: int


class LatestDataResponse(BaseModel):
    device_id: int
    last_seen_at: datetime | None
    latest_values: dict[str, Any] | None


class HistoryPoint(BaseModel):
    time: datetime
    field: str
    value: float
