# Refrigeration Monitoring System (Backend)

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

Backend API: `http://localhost:8000`

## Default credentials
- username: `admin`
- password: `admin123`

## Implemented endpoints
- `POST /api/v1/auth/login`
- `GET /api/v1/devices`
- `POST /api/v1/devices`
- `GET /api/v1/devices/{id}`
- `GET /api/v1/devices/{id}/latest`
- `GET /api/v1/devices/{id}/history`
- `POST /api/v1/devices/{id}/write`
- `GET /api/v1/alarms`
- `GET /api/v1/alarms/active`
