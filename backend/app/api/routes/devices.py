from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, require_roles
from app.models.device import Device
from app.models.enums import UserRole
from app.schemas.device import (
    DeviceCreate,
    DeviceRead,
    DeviceWriteRequest,
    HistoryPoint,
    LatestDataResponse,
)
from app.services.influx_service import InfluxService
from app.services.modbus_service import ModbusService

router = APIRouter(prefix='/devices', tags=['devices'])
modbus_service = ModbusService()
influx_service = InfluxService()


@router.get('', response_model=list[DeviceRead])
async def list_devices(db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer))) -> list[Device]:
    return list((await db.execute(select(Device))).scalars().all())


@router.post('', response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
async def create_device(payload: DeviceCreate, db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician))) -> Device:
    device = Device(**payload.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device


@router.get('/{device_id}', response_model=DeviceRead)
async def get_device(device_id: int, db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer))) -> Device:
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail='Device not found')
    return device


@router.get('/{device_id}/latest', response_model=LatestDataResponse)
async def get_latest(device_id: int, db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer))) -> LatestDataResponse:
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail='Device not found')
    return LatestDataResponse(device_id=device.id, last_seen_at=device.last_seen_at, latest_values=device.latest_values)


@router.get('/{device_id}/history', response_model=list[HistoryPoint])
async def get_history(
    device_id: int,
    minutes: int = Query(default=60, ge=1, le=10080),
    db: AsyncSession = DBSession,
    _: dict = Depends(require_roles(UserRole.admin, UserRole.technician, UserRole.viewer)),
) -> list[HistoryPoint]:
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail='Device not found')
    return influx_service.get_history(device_id=device_id, minutes=minutes)


@router.post('/{device_id}/write', status_code=status.HTTP_204_NO_CONTENT)
async def write_register(device_id: int, payload: DeviceWriteRequest, db: AsyncSession = DBSession, _: dict = Depends(require_roles(UserRole.admin, UserRole.technician))) -> None:
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail='Device not found')
    await modbus_service.write_register(device, payload.register, payload.value)
