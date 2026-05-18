# HoneybeeTrips

Premium travel agency marketing site — React (Vite), Tailwind CSS, Framer Motion, Lucide. Static export suitable for Hostinger shared hosting (no backend).

## Develop

```bash
npm install
npm run dev
```

`npm run dev` starts **Vite** and the **local PHP admin API** on `127.0.0.1:8000` (so `/admin-api` proxy works). If you only need the UI without CMS data, use `npm run dev:vite` and either start `npm run dev:admin-api` in another terminal or set `VITE_ADMIN_PUBLIC_BASE` in `.env` to a hosted `public.php` URL.

## Build for Hostinger

```bash
npm run build
```

Upload **everything inside** the `dist/` folder to your Hostinger `public_html` directory (or subdomain root). Include the `.htaccess` file from `public/` — Vite copies it into `dist/` so client-side routes (e.g. `/destinations`) resolve to `index.html`.

Replace placeholder WhatsApp number and phone links in `WhatsAppFloat.jsx`, `Contact.jsx`, and `Navbar` as needed.

## Stack

- React 18, Vite 5, React Router 6  
- Tailwind CSS 3  
- Framer Motion  
- Lucide React  
