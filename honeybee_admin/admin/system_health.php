<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

function table_exists(PDO $pdo, string $table): bool
{
    $driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'sqlite') {
        $stmt = $pdo->prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=:name LIMIT 1");
        $stmt->execute([':name' => $table]);
        return (bool) $stmt->fetchColumn();
    }

    $stmt = $pdo->prepare('SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :name LIMIT 1');
    $stmt->execute([':name' => $table]);
    return (bool) $stmt->fetchColumn();
}

function try_http_json(string $url, int $timeoutSeconds = 3): array
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => $timeoutSeconds,
            'ignore_errors' => true,
            'header' => "Accept: application/json\r\n",
        ],
    ]);
    $body = @file_get_contents($url, false, $context);
    $ok = false;
    if (is_string($body) && $body !== '') {
        $json = json_decode($body, true);
        $ok = is_array($json) && (isset($json['data']) || isset($json['error']));
    }
    return ['ok' => $ok, 'body' => is_string($body) ? $body : ''];
}

$pdo = null;
$dbOk = false;
$dbErr = '';
try {
    $pdo = db();
    $pdo->query('SELECT 1')->fetchColumn();
    $dbOk = true;
} catch (Throwable $e) {
    $dbOk = false;
    $dbErr = $e->getMessage();
}

$uploadsDir = UPLOADS_DIR;
$uploadsExists = is_dir($uploadsDir);
$uploadsWritable = $uploadsExists && is_writable($uploadsDir);

$requiredTables = [
    'admins',
    'packages',
    'package_images',
    'itineraries',
    'package_hotels',
    'destinations',
    'destination_package',
    'bookings',
    'enquiries',
    'media',
    'settings',
    'seo_meta',
    'activity_logs',
    'reviews',
    'blogs',
    'cms_items',
];

$tables = [];
if ($dbOk && $pdo instanceof PDO) {
    foreach ($requiredTables as $t) {
        $tables[$t] = table_exists($pdo, $t);
    }
}

$baseUrl = trim((string) (defined('APP_BASE_URL') ? APP_BASE_URL : ''));
$apiCheck = ['skipped' => true, 'ok' => false, 'url' => '', 'body' => ''];
if ($baseUrl !== '') {
    $url = rtrim($baseUrl, '/') . app_path('/api/public.php?resource=settings');
    $res = try_http_json($url);
    $apiCheck = ['skipped' => false, 'ok' => (bool) $res['ok'], 'url' => $url, 'body' => (string) $res['body']];
}

render_layout_start('System Health', 'system_health');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">System Health</h3>
  <p class="mt-1 text-sm text-slate-500">Quick diagnostics for DB, storage, and public APIs.</p>
</section>

<section class="mt-5 grid gap-4 lg:grid-cols-3">
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Database</p>
    <p class="mt-2 text-sm">
      <span class="<?= $dbOk ? 'text-emerald-700' : 'text-rose-700' ?> font-semibold">
        <?= $dbOk ? 'OK' : 'FAILED' ?>
      </span>
      <span class="text-slate-500">Driver: <?= e($pdo instanceof PDO ? (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) : 'n/a') ?></span>
    </p>
    <?php if (!$dbOk): ?>
      <p class="mt-2 text-xs text-rose-700 break-words"><?= e($dbErr) ?></p>
    <?php endif; ?>
    <p class="mt-3 text-xs text-slate-500">Mode: <?= DEMO_MODE ? 'DEMO (SQLite)' : 'MySQL' ?></p>
  </article>

  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Uploads</p>
    <p class="mt-2 text-sm">
      <span class="<?= $uploadsExists ? 'text-emerald-700' : 'text-rose-700' ?> font-semibold">
        <?= $uploadsExists ? 'Directory exists' : 'Missing directory' ?>
      </span>
    </p>
    <p class="mt-1 text-xs text-slate-500 break-words"><?= e($uploadsDir) ?></p>
    <p class="mt-3 text-sm">
      <span class="<?= $uploadsWritable ? 'text-emerald-700' : 'text-rose-700' ?> font-semibold">
        <?= $uploadsWritable ? 'Writable' : 'Not writable' ?>
      </span>
    </p>
    <p class="mt-1 text-xs text-slate-500">Uploads URL prefix: <?= e(UPLOADS_URL) ?></p>
  </article>

  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Public API</p>
    <?php if ($apiCheck['skipped']): ?>
      <p class="mt-2 text-sm text-slate-700">
        <span class="font-semibold text-amber-700">Skipped</span>
        <span class="text-slate-500">Set `HB_APP_BASE_URL` (env or `.env`) to enable server-side check.</span>
      </p>
    <?php else: ?>
      <p class="mt-2 text-sm">
        <span class="<?= $apiCheck['ok'] ? 'text-emerald-700' : 'text-rose-700' ?> font-semibold">
          <?= $apiCheck['ok'] ? 'OK' : 'FAILED' ?>
        </span>
      </p>
      <p class="mt-1 text-xs text-slate-500 break-words"><?= e((string) $apiCheck['url']) ?></p>
    <?php endif; ?>
  </article>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h4 class="font-semibold">Required tables</h4>
  <?php if (!$dbOk): ?>
    <p class="mt-2 text-sm text-slate-600">DB is not reachable, so table checks are unavailable.</p>
  <?php else: ?>
    <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($requiredTables as $t): ?>
        <?php $ok = (bool) ($tables[$t] ?? false); ?>
        <div class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <span class="<?= $ok ? 'text-emerald-700' : 'text-rose-700' ?> font-semibold"><?= $ok ? 'OK' : 'MISSING' ?></span>
          <span class="ml-2 font-mono text-xs text-slate-700"><?= e($t) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>

<?php render_layout_end(); ?>

