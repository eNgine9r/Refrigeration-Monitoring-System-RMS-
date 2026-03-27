# ColdChain Control Frontend

GitHub Pages URL (auto deploy):

- https://engine9r.github.io/Refrigeration-Monitoring-System-RMS-/

## Zero-config demo behavior

- Uses `HashRouter` for GitHub Pages-safe routing.
- Vite base path is hardcoded to `/Refrigeration-Monitoring-System-RMS-/`.
- Production builds always run in `mock` mode.
- No backend, no device connection, no `.env` setup required.

## Local run

```bash
npm install
npm run build
npm run preview
```

Demo credentials: `demo` / `demo`

## Auto deployment

- GitHub Action: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Steps: install → build frontend → deploy Pages artifact
