# Honeybee Trips — Website (Frontend)

## Live site (send this link to your client)

**https://cloudelixir.github.io/honeybee/**

Example package page:  
**https://cloudelixir.github.io/honeybee/packages/bali-romantic-escape**

Package content (itinerary, hotels, prices) is loaded from the hosted CMS API configured at build time.

---

## For developers

```bash
cd frontend
npm install
npm run dev:vite
```

Open http://localhost:5173

To publish an update to GitHub Pages:

```bash
cd frontend
npm run deploy:pages
```

Requires GitHub Pages enabled: **Settings → Pages → Branch `gh-pages` / root**.

---

## Repository contents

This repo contains **only the React frontend** (`frontend/`).  
The PHP admin CMS runs separately on Hostinger (not included here).
