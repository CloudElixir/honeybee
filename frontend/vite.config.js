import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Must match `php -S` (or Apache) that serves honeybee_admin/api/public.php — default :8000
  const phpProxyTarget = (env.VITE_PHP_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/$/, '')

  const base = (env.VITE_BASE_PATH || '/').replace(/\/?$/, '/')

  return {
    plugins: [react()],
    base,
    server: {
      proxy: {
        // Local dev: forward frontend calls to PHP admin server.
        // Usage: fetch("/admin-api?resource=settings") etc.
        '/admin-api': {
          target: phpProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/admin-api\/?/, '/api/public.php'),
        },
      },
    },
  }
})
