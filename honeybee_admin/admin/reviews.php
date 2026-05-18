<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$rows = db()->query('SELECT * FROM reviews ORDER BY id DESC')->fetchAll();

render_layout_start('Reviews', 'reviews');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Add review</h3>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-4 grid gap-3 sm:grid-cols-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="review_save">
    <input name="name" required placeholder="Guest name" class="rounded-lg border px-3 py-2">
    <input name="route" required placeholder="Trip route (e.g. Bali + Gili)" class="rounded-lg border px-3 py-2">
    <textarea name="text" required placeholder="Review text" class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
    <input name="rating" type="number" min="1" max="5" step="0.1" value="5" required class="rounded-lg border px-3 py-2">
    <select name="status" class="rounded-lg border px-3 py-2">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Review</button>
  </form>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Saved reviews</h3>
  <input id="reviewSearch" placeholder="Search guest/route..." class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
  <div class="mt-4 space-y-3">
    <?php foreach ($rows as $r): ?>
      <article class="rounded-lg border border-slate-200 p-3 review-item" data-name="<?= e(strtolower((string) $r['name'])) ?>" data-route="<?= e(strtolower((string) $r['route'])) ?>">
        <div class="flex items-start justify-between gap-3">
          <div>
            <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="grid gap-2 rounded border border-slate-200 p-2">
              <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
              <input type="hidden" name="action" value="review_save">
              <input type="hidden" name="id" value="<?= e((string) $r['id']) ?>">
              <input name="name" value="<?= e($r['name']) ?>" class="rounded border px-2 py-1 text-xs">
              <input name="route" value="<?= e($r['route']) ?>" class="rounded border px-2 py-1 text-xs">
              <textarea name="text" class="rounded border px-2 py-1 text-xs"><?= e($r['text']) ?></textarea>
              <div class="grid grid-cols-2 gap-2">
                <input name="rating" type="number" min="1" max="5" step="0.1" value="<?= e((string) $r['rating']) ?>" class="rounded border px-2 py-1 text-xs">
                <select name="status" class="rounded border px-2 py-1 text-xs">
                  <option value="active" <?= $r['status'] === 'active' ? 'selected' : '' ?>>Active</option>
                  <option value="inactive" <?= $r['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option>
                </select>
              </div>
              <button class="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Update</button>
            </form>
          </div>
          <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete review?')">
            <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
            <input type="hidden" name="action" value="review_delete">
            <input type="hidden" name="id" value="<?= e((string) $r['id']) ?>">
            <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
          </form>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</section>
<script>
  const reviewSearch = document.getElementById('reviewSearch');
  const reviewItems = Array.from(document.querySelectorAll('.review-item'));
  reviewSearch?.addEventListener('input', () => {
    const q = reviewSearch.value.trim().toLowerCase();
    reviewItems.forEach((item) => {
      const hay = `${item.dataset.name || ''} ${item.dataset.route || ''}`;
      item.style.display = !q || hay.includes(q) ? '' : 'none';
    });
  });
</script>
<?php render_layout_end(); ?>

