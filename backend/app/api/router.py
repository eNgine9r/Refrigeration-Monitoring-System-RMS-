from fastapi import APIRouter

from app.api.routes import alarms, auth, devices

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(devices.router)
api_router.include_router(alarms.router)
