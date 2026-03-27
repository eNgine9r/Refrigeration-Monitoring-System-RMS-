from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False)

    app_name: str = 'Refrigeration Monitoring System'
    debug: bool = False
    api_prefix: str = '/api/v1'

    postgres_dsn: str = 'postgresql+asyncpg://rms:rms@postgres:5432/rms'

    influxdb_url: str = 'http://influxdb:8086'
    influxdb_token: str = 'rms-token'
    influxdb_org: str = 'rms'
    influxdb_bucket: str = 'temperatures'

    jwt_secret_key: str = 'please-change-me'
    jwt_algorithm: str = 'HS256'
    jwt_expire_minutes: int = 60

    webhook_timeout_seconds: float = 5.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
