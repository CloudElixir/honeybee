# HoneyBee Trips — PHP Admin (`honeybee_admin/`)

Standalone CRM/CMS for packages, itineraries, destinations, CMS blocks, and the **public JSON API** (`api/public.php`) used by the React site.

## Folder layout

```
honeybee_admin/
  admin/          UI (Tailwind + Alpine)
  api/            admin actions + public JSON
  uploads/        media (must be writable)
  migrations/
  storage/        sessions, optional api.log
  bootstrap.php
  config.php
  index.php       root redirect → admin (for Hostinger docroot)
  schema.sql
  create_admin.php
```

## Hostinger — deploy to `https://salmon-mole-607064.hostingersite.com/`

1. In hPanel, open **Websites → Manage → Files** for that site. Open **`public_html`** (or the domain’s document root).

2. **Upload the contents of this `honeybee_admin/` folder** (not the outer `phase1` zip): you should see at the web root:
   - `admin/`, `api/`, `bootstrap.php`, `config.php`, `index.php`, `.htaccess`, etc.

3. **MySQL**: create a database and user in Hostinger; note host (often `localhost`), name, user, password.

4. **`.env` on the server** (create in the same folder as `config.php` — copy from `.env.example`):
   - Set `HB_DB_*` to your MySQL credentials.
   - Set `HB_APP_BASE_URL=https://salmon-mole-607064.hostingersite.com` (no trailing slash).
   - Set `HB_APP_CORS_ORIGINS` to your **frontend** origin(s), e.g.  
     `https://slategrey-hamster-219402.hostingersite.com`  
     (comma-separated if you have more, e.g. add `http://localhost:5173` for local dev calling this API).
   - Leave `HB_APP_BASE_PATH` **empty** when the app is at the domain root (paths are `/admin/...`, `/api/...`).

5. **Import schema**: in phpMyAdmin, import `schema.sql` into that database.

6. **First admin user**: in the browser, open once:  
   `https://salmon-mole-607064.hostingersite.com/create_admin.php`  
   Then log in at:  
   `https://salmon-mole-607064.hostingersite.com/admin/login.php`  
   **Delete or rename `create_admin.php` after use.**

7. **Permissions**: ensure `uploads/` and `storage/` are writable by PHP (775 or as Hostinger recommends).

8. **Public API** (for the frontend build):  
   `https://salmon-mole-607064.hostingersite.com/api/public.php?resource=packages`

### If the site root shows “Index of” or 403

Open **`https://salmon-mole-607064.hostingersite.com/`** — `index.php` should redirect to login. Ensure **PHP** is enabled and **Apache** is serving `index.php` as directory index (`.htaccess` sets `DirectoryIndex`).

### If admin is in a **subfolder** (not your case)

Set e.g. `HB_APP_BASE_PATH=/honeybee_admin` so links and uploads resolve under that prefix.

## Features

- Session-based admin login, package/itinerary/hotel/destination CMS, media, bookings, enquiries, homepage CMS, SEO settings.
- Public read API: `api/public.php` (`packages`, `destinations`, `settings`, etc.).

## Frontend

Set the Vite production env to the full `public.php` URL, e.g.:

`VITE_ADMIN_PUBLIC_BASE=https://salmon-mole-607064.hostingersite.com/api/public.php`

## Migrations / seed data

See `migrations/` (e.g. `import_existing_data.php`, seed scripts). Run PHP CLI on the server or locally against the same DB as needed.
