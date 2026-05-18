<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$media = db()->query('SELECT * FROM media ORDER BY id DESC')->fetchAll();

render_layout_start('Media Manager', 'media');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Upload images</h3>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-4 flex flex-wrap gap-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="media_upload">
    <input type="file" name="images[]" multiple required accept="image/*" class="rounded-lg border px-3 py-2">
    <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Upload</button>
  </form>
</section>

<section class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <?php foreach ($media as $m): ?>
    <article class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <img src="<?= e($m['file_path']) ?>" alt="" class="h-36 w-full rounded-lg object-cover">
      <p class="mt-2 truncate text-xs text-slate-500"><?= e($m['file_name']) ?></p>
      <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-2" onsubmit="return confirm('Delete media?')">
        <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="action" value="media_delete">
        <input type="hidden" name="id" value="<?= e((string) $m['id']) ?>">
        <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
      </form>
    </article>
  <?php endforeach; ?>
</section>
<?php render_layout_end(); ?>

