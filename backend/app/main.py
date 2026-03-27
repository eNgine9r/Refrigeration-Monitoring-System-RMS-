import logging

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User
from app.workers.polling_worker import PollingWorker

settings = get_settings()
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
)

app = FastAPI(title=settings.app_name)
app.include_router(api_router, prefix=settings.api_prefix)
polling_worker = PollingWorker()


@app.get('/health')
async def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.on_event('startup')
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        admin = await session.get(User, 1)
        if admin is None:
            session.add(User(username='admin', password_hash=hash_password('admin123'), role=UserRole.admin))
            await session.commit()

    await polling_worker.start()


@app.on_event('shutdown')
async def on_shutdown() -> None:
    await polling_worker.stop()
