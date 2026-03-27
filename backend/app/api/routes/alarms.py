from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, require_roles
from app.models.alarm import Alarm
from app.models.enums import AlarmStatus, UserRole
from app.schemas.alarm import AlarmRead

router = APIRouter(prefix='/alarms', tags=['alarms'])


@router.get('', response_model=list[AlarmRead])
async def list_alarms(db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer))) -> list[Alarm]:
    return list((await db.execute(select(Alarm).order_by(Alarm.started_at.desc()))).scalars().all())


@router.get('/active', response_model=list[AlarmRead])
async def list_active_alarms(db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer))) -> list[Alarm]:
    return list((await db.execute(select(Alarm).where(Alarm.status == AlarmStatus.active).order_by(Alarm.started_at.desc()))).scalars().all())
