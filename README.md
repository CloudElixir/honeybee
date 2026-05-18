# Honeybee Trips

Luxury travel marketing site (React + Vite) with a PHP admin CMS for packages, itineraries, and hotels.

## Live site (GitHub Pages)

**URL:** https://cloudelixir.github.io/honeybee/

### One-time GitHub setup

1. Create the repo: https://github.com/CloudElixir/honeybee
2. **Settings → Pages → Build and deployment → Branch:** `gh-pages` / `/ (root)`
3. On Hostinger admin, add GitHub to CORS (see below)

### Publish the site

```bash
cd frontend
npm install
npm run deploy:pages
```

This builds the app and pushes `frontend/dist` to the `gh-pages` branch.

> **Note:** Git push tokens need `repo` scope. If push fails on `.github/workflows`, use `npm run deploy:pages` instead, or add the `workflow` scope to your PAT and enable **Pages → GitHub Actions**.

Package data comes from the hosted admin API. On Hostinger, add this origin to CORS:

```env
HB_APP_CORS_ORIGINS=https://cloudelixir.github.io,https://slategrey-hamster-219402.hostingersite.com,http://localhost:5173
```

## Local development

```bash
cd frontend
npm install
npm run dev
```

This starts Vite (`:5173`) and the PHP API (`:8000`). Open http://localhost:5173

Admin panel (local): http://127.0.0.1:8000/admin/

## Project layout

| Path | Description |
|------|-------------|
| `frontend/` | React SPA (public website) |
| `honeybee_admin/` | PHP CMS + public API (`api/public.php`) |

## Production build

```bash
cd frontend
npm run build
```

For GitHub Pages locally:

```bash
VITE_BASE_PATH=/honeybee/ VITE_SITE_URL=https://cloudelixir.github.io/honeybee npm run build
```

## Custom domain

To use your own domain instead of `github.io`, set the custom domain in GitHub repo **Settings → Pages**, then update `VITE_SITE_URL` and `VITE_BASE_PATH=/` in `.github/workflows/deploy-pages.yml`.
