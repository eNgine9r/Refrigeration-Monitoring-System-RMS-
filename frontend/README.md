# ColdChain Control Frontend

Modern SaaS-style SCADA UI for refrigeration monitoring.

## Features

- Dark-mode-first design system
- Dashboard with KPI cards, trend overlays, alarm panel, device status grid
- Devices page with table/grid toggle, search, filter, sorting
- Rich Device Detail with 24h/7d chart, parameters, control panel, alarm history
- Controller simulator page (Carel / Dixell / Eliwell style)
- Alarms center with filters and detail modal actions
- Analytics page (comparison + alarm frequency)
- Locations page (multi-store scaling)
- Settings page (users + system + API mode)

## Modes

- `mock` (default): works without backend/devices
- `live`: connects to FastAPI backend

## Run demo locally

```bash
cp .env.example .env
npm install
npm run build
npm run preview
```

Demo credentials: `demo` / `demo`

## Deploy to GitHub Pages

1. Set base path in `.env`:

```bash
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/
```

2. Build:

```bash
npm run build
```

3. Publish the generated `dist/` directory with GitHub Pages.
