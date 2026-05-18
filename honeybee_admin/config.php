<?php
declare(strict_types=1);

/**
 * HoneyBee Trips Admin configuration.
 * Configure via environment variables (recommended).
 *
 * Supported env vars (either server env or `honeybee_admin/.env`):
 * - HB_DB_HOST
 * - HB_DB_PORT
 * - HB_DB_NAME
 * - HB_DB_USER
 * - HB_DB_PASS
 * - HB_APP_BASE_URL
 * - HB_APP_BASE_PATH
 * - HB_APP_CORS_ORIGINS
 * - HB_API_DEBUG (1/true: append lines to storage/api.log for public API requests)
 */

// Lightweight `.env` loader (no external dependency).
// This is intentionally minimal: KEY=VALUE lines, with optional quotes.
$envFile = __DIR__ . '/.env';
if (is_file($envFile) && is_readable($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));
        if ($key === '') {
            continue;
        }
        if ((str_starts_with($val, '"') && str_ends_with($val, '"')) || (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
            $val = substr($val, 1, -1);
        }
        if (getenv($key) === false) {
            putenv($key . '=' . $val);
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

define('DB_HOST', getenv('HB_DB_HOST') ?: 'localhost');
define('DB_PORT', (int) (getenv('HB_DB_PORT') ?: 3306));
define('DB_NAME', getenv('HB_DB_NAME') ?: 'u625306522_honeybee');
define('DB_USER', getenv('HB_DB_USER') ?: 'u625306522_honeybeeuser');
define('DB_PASS', getenv('HB_DB_PASS') ?: '');

define('APP_NAME', 'HoneyBee Trips Admin');
// Used by System Health to test public API reachability (must be THIS app’s base URL where `api/public.php` is served).
define('APP_BASE_URL', getenv('HB_APP_BASE_URL') ?: '');

define('UPLOADS_DIR', __DIR__ . '/uploads');
// If this admin is hosted under a subfolder (e.g. "/honeybee-admin"), set it here.
// For local `php -S` started inside `honeybee-admin/`, keep it empty.
// If you deployed the contents of `honeybee-admin/` at your domain root,
// keep this empty so routes look like `/admin/login.php` and `/api/public.php`.
// If you deployed it under a subfolder (e.g. `/honeybee-admin`), set it there.
define('APP_BASE_PATH', getenv('HB_APP_BASE_PATH') ?: '');
define('UPLOADS_URL', APP_BASE_PATH . '/uploads');

// Comma-separated list of allowed frontend origins for public API (CORS).
// Example: 'https://honeybeetrips.com,https://www.honeybeetrips.com'
define('APP_CORS_ORIGINS', getenv('HB_APP_CORS_ORIGINS') ?: '');

// Temporary local testing mode (no MySQL required).
// Auto-fallback to demo mode when pdo_mysql is unavailable locally.
$demoModeEnv = getenv('HB_DEMO_MODE');
if ($demoModeEnv !== false && $demoModeEnv !== '') {
    define('DEMO_MODE', filter_var($demoModeEnv, FILTER_VALIDATE_BOOLEAN));
} else {
    define('DEMO_MODE', !extension_loaded('pdo_mysql'));
}
define('DEMO_SQLITE_PATH', __DIR__ . '/storage/demo.sqlite');

