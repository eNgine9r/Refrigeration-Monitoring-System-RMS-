from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import AlarmStatus, AlarmType


class Alarm(Base):
    __tablename__ = 'alarms'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey('devices.id', ondelete='CASCADE'), nullable=False, index=True)
    alarm_type: Mapped[AlarmType] = mapped_column(Enum(AlarmType), nullable=False, index=True)
    status: Mapped[AlarmStatus] = mapped_column(Enum(AlarmStatus), default=AlarmStatus.active, nullable=False, index=True)
    severity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    message: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
