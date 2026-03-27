from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Device(Base):
    __tablename__ = 'devices'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    protocol: Mapped[str] = mapped_column(String(10), default='rtu', nullable=False)
    host: Mapped[str | None] = mapped_column(String(255), nullable=True)
    port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    serial_port: Mapped[str | None] = mapped_column(String(64), nullable=True)
    baudrate: Mapped[int] = mapped_column(Integer, default=9600, nullable=False)
    modbus_address: Mapped[int] = mapped_column(Integer, nullable=False)
    polling_interval_sec: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    register_map: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    high_temp_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    low_temp_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    latest_values: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
