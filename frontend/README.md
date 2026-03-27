# RMS Frontend Demo

This frontend supports two modes:

- `mock` (default): fully functional demo without backend
- `live`: real backend integration via FastAPI

## Local demo run (no backend needed)

```bash
cp .env.example .env
npm install
npm run build
npm run preview
```

Default demo credentials:

- username: `demo`
- password: `demo`

## Live mode

Set in `.env`:

```bash
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## GitHub Pages deployment

1. Set base path (repo name):

```bash
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/
```

2. Build static output:

```bash
npm run build
```

3. Publish `dist/` using GitHub Pages (Actions or `gh-pages` branch).

If using GitHub Actions, upload `dist` as Pages artifact.
