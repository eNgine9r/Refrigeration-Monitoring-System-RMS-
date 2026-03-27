from datetime import datetime, timedelta, timezone

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

from app.core.config import get_settings
from app.schemas.device import HistoryPoint


class InfluxService:
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.influxdb_bucket
        self.org = settings.influxdb_org
        self.client = InfluxDBClient(url=settings.influxdb_url, token=settings.influxdb_token, org=self.org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()

    def write_temperature(self, device_id: int, fields: dict[str, float], event_time: datetime | None = None) -> None:
        point = Point('device_telemetry').tag('device_id', str(device_id)).time(event_time or datetime.now(timezone.utc))
        for key, value in fields.items():
            point.field(key, value)
        self.write_api.write(bucket=self.bucket, org=self.org, record=point)

    def get_history(self, device_id: int, minutes: int = 60) -> list[HistoryPoint]:
        start = f'-{minutes}m'
        flux = (
            f'from(bucket: "{self.bucket}") '
            f'|> range(start: {start}) '
            f'|> filter(fn: (r) => r._measurement == "device_telemetry") '
            f'|> filter(fn: (r) => r.device_id == "{device_id}")'
        )

        result = self.query_api.query(org=self.org, query=flux)
        points: list[HistoryPoint] = []
        for table in result:
            for rec in table.records:
                ts = rec.get_time()
                if ts is None:
                    ts = datetime.now(timezone.utc)
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                points.append(HistoryPoint(time=ts, field=str(rec.get_field()), value=float(rec.get_value())))
        return points
