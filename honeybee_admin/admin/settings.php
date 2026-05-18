<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$rows = db()->query('SELECT `key`,`value` FROM settings')->fetchAll();
$settings = [];
foreach ($rows as $row) {
    $settings[$row['key']] = $row['value'];
}
$seoRows = db()->query('SELECT * FROM seo_meta ORDER BY id DESC LIMIT 20')->fetchAll();

render_layout_start('Settings + SEO', 'settings');
?>
<div class="grid gap-4 xl:grid-cols-2">
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="text-lg font-semibold">Business & Admin settings</h3>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-4 grid gap-3">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="settings_save">
      <input name="site_phone" value="<?= e($settings['site_phone'] ?? '') ?>" placeholder="Phone" class="rounded-lg border px-3 py-2">
      <input name="site_email" value="<?= e($settings['site_email'] ?? '') ?>" placeholder="Email" class="rounded-lg border px-3 py-2">
      <input name="site_address" value="<?= e($settings['site_address'] ?? '') ?>" placeholder="Address" class="rounded-lg border px-3 py-2">
      <input name="facebook" value="<?= e($settings['facebook'] ?? '') ?>" placeholder="Facebook URL" class="rounded-lg border px-3 py-2">
      <input name="instagram" value="<?= e($settings['instagram'] ?? '') ?>" placeholder="Instagram URL" class="rounded-lg border px-3 py-2">
      <input name="youtube" value="<?= e($settings['youtube'] ?? '') ?>" placeholder="YouTube URL" class="rounded-lg border px-3 py-2">
      <hr>
      <p class="text-sm font-semibold">Update admin credentials</p>
      <input name="admin_email" placeholder="New admin email" class="rounded-lg border px-3 py-2">
      <input name="admin_password" placeholder="New password" type="password" class="rounded-lg border px-3 py-2">
      <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Settings</button>
    </form>
  </section>

  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="text-lg font-semibold">SEO Management</h3>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-4 grid gap-3">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="seo_save">
      <input name="scope" placeholder="Scope (global/package/destination)" class="rounded-lg border px-3 py-2" required>
      <input name="slug" placeholder="Slug (optional for global)" class="rounded-lg border px-3 py-2">
      <input name="meta_title" placeholder="Meta title" class="rounded-lg border px-3 py-2">
      <textarea name="meta_description" placeholder="Meta description" class="rounded-lg border px-3 py-2"></textarea>
      <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save SEO</button>
    </form>
    <div class="mt-4 overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600"><tr><th class="px-2 py-1">Scope</th><th class="px-2 py-1">Slug</th><th class="px-2 py-1">Title</th></tr></thead>
        <tbody>
          <?php foreach ($seoRows as $s): ?>
            <tr class="border-t border-slate-100"><td class="px-2 py-1"><?= e($s['scope']) ?></td><td class="px-2 py-1"><?= e($s['slug']) ?></td><td class="px-2 py-1"><?= e($s['meta_title']) ?></td></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
</div>
<?php render_layout_end(); ?>

