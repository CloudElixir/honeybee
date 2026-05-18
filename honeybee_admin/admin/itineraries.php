<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$packages = db()->query('SELECT id, title FROM packages ORDER BY title')->fetchAll();
$itineraries = db()->query('SELECT i.*, COALESCE(p.title, \'(no package — re-save with package selected)\') AS package_title FROM itineraries i LEFT JOIN packages p ON p.id = i.package_id ORDER BY p.title, i.sort_order, i.day_number, i.id')->fetchAll();
$itineraryImages = db()->query('SELECT id, itinerary_id, image_path FROM itinerary_images ORDER BY id DESC')->fetchAll();
$imagesByItinerary = [];
foreach ($itineraryImages as $img) {
    $itineraryId = (int) ($img['itinerary_id'] ?? 0);
    if (!isset($imagesByItinerary[$itineraryId])) {
        $imagesByItinerary[$itineraryId] = [];
    }
    $imagesByItinerary[$itineraryId][] = $img;
}

$byPackage = [];
foreach ($itineraries as $row) {
    $pid = (int) ($row['package_id'] ?? 0);
    if (!isset($byPackage[$pid])) {
        $byPackage[$pid] = ['title' => (string) ($row['package_title'] ?? ''), 'rows' => []];
    }
    $byPackage[$pid]['rows'][] = $row;
}

render_layout_start('Itineraries', 'itineraries');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Add day-wise itinerary</h3>
  <p class="mt-1 text-sm text-slate-600">Days appear on the website in <strong>sort order</strong>, then trip day number. Use <strong>Move up/down</strong> on saved days to reorder.</p>
  <p class="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-700">
    <strong class="text-blue-900">Activity format (Bali Romantic Escape &amp; Bayard layout):</strong> one activity per line as
    <code class="rounded bg-white px-1 font-mono text-xs">Label: description</code> — e.g.
    <code class="rounded bg-white px-1 font-mono text-xs">Arrival: Land at Ngurah Rai International Airport…</code>
  </p>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-4 space-y-3">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="itinerary_save">
    <select name="package_id" required class="w-full rounded-lg border px-3 py-2">
      <option value="" disabled selected>Choose package</option>
      <?php foreach ($packages as $p): ?><option value="<?= e((string) $p['id']) ?>"><?= e($p['title']) ?></option><?php endforeach; ?>
    </select>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-700">Trip day number</label>
        <p class="mb-1 text-[11px] text-slate-500">Shown as “Day N” on the site.</p>
        <input name="day_number" type="number" min="1" required value="1" class="w-full rounded-lg border px-3 py-2">
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-700">Sort order</label>
        <p class="mb-1 text-[11px] text-slate-500">Lower numbers appear first. Prefer <strong>reorder buttons</strong> below for saved days.</p>
        <input name="sort_order" type="number" min="0" value="0" class="w-full rounded-lg border px-3 py-2">
      </div>
    </div>
    <input name="title" required placeholder="Day title" class="w-full rounded-lg border px-3 py-2">
    <textarea name="description" required placeholder="Arrival: Land at Ngurah Rai…&#10;Check-in: Private villa welcome…&#10;Leisure Time: Sunset at the beach…" class="min-h-[120px] w-full rounded-lg border px-3 py-2 font-mono text-sm"></textarea>
    <div>
      <label class="mb-1 block text-sm font-medium">Day cover image (optional)</label>
      <input type="file" name="image" accept="image/*" class="w-full rounded-lg border px-3 py-2">
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium">Additional day images</label>
      <input type="file" name="images[]" multiple accept="image/*" class="w-full rounded-lg border px-3 py-2">
    </div>
    <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Itinerary</button>
  </form>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <h4 class="font-semibold">Saved itinerary by package</h4>
  <input id="itinerarySearch" placeholder="Filter packages…" class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
  <div class="mt-4 space-y-6">
    <?php foreach ($byPackage as $pid => $block): ?>
      <div class="package-itinerary-block rounded-xl border border-slate-200 bg-slate-50/50 p-3" data-package-title="<?= e(strtolower((string) $block['title'])) ?>">
        <p class="text-sm font-semibold text-slate-900"><?= e($block['title']) ?></p>
        <div class="mt-3 space-y-3">
          <?php foreach ($block['rows'] as $row): ?>
            <article class="rounded-lg border border-slate-200 bg-white p-3 itinerary-item" data-package="<?= e(strtolower((string) $row['package_title'])) ?>" data-title="<?= e(strtolower((string) $row['title'])) ?>" data-description="<?= e(strtolower((string) $row['description'])) ?>">
              <p class="text-xs uppercase tracking-wide text-slate-500">
                Trip day <?= e((string) $row['day_number']) ?> · sort <?= e((string) ($row['sort_order'] ?? '0')) ?>
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="inline">
                  <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="itinerary_move">
                  <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <input type="hidden" name="dir" value="up">
                  <button type="submit" class="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50">Move up</button>
                </form>
                <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="inline">
                  <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="itinerary_move">
                  <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <input type="hidden" name="dir" value="down">
                  <button type="submit" class="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50">Move down</button>
                </form>
                <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="inline" onsubmit="return confirm('Duplicate this day?')">
                  <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="itinerary_duplicate">
                  <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <button type="submit" class="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100">Duplicate day</button>
                </form>
              </div>
              <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-2 grid gap-2 rounded border border-slate-200 p-2">
                <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="action" value="itinerary_save">
                <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                <select name="package_id" required class="w-full rounded border px-2 py-1 text-xs">
                  <?php foreach ($packages as $p): ?>
                    <option value="<?= e((string) $p['id']) ?>" <?= (int) $p['id'] === (int) $row['package_id'] ? 'selected' : '' ?>><?= e($p['title']) ?></option>
                  <?php endforeach; ?>
                </select>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label class="mb-0.5 block text-[10px] font-semibold text-slate-600">Trip day</label>
                    <input name="day_number" type="number" min="1" value="<?= e((string) $row['day_number']) ?>" class="w-full rounded border px-2 py-1 text-xs">
                  </div>
                  <div>
                    <label class="mb-0.5 block text-[10px] font-semibold text-slate-600">Sort order</label>
                    <input name="sort_order" type="number" min="0" value="<?= e((string) $row['sort_order']) ?>" class="w-full rounded border px-2 py-1 text-xs">
                  </div>
                </div>
                <input name="title" value="<?= e($row['title']) ?>" class="rounded border px-2 py-1 text-xs">
                <p class="text-[10px] text-slate-500">One activity per line: <code>Label: description</code></p>
                <textarea name="description" class="min-h-[100px] rounded border px-2 py-1 text-xs font-mono"><?= e($row['description']) ?></textarea>
                <?php if (!empty($row['image_path'])): ?>
                  <img src="<?= e($row['image_path']) ?>" alt="" class="h-24 w-full rounded object-cover">
                <?php endif; ?>
                <?php $dayImages = $imagesByItinerary[(int) $row['id']] ?? []; ?>
                <?php if (!empty($dayImages)): ?>
                  <div class="grid grid-cols-3 gap-2">
                    <?php foreach ($dayImages as $img): ?>
                      <div class="space-y-1">
                        <img src="<?= e($img['image_path']) ?>" alt="" class="h-16 w-full rounded object-cover">
                        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Remove this gallery image?')">
                          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                          <input type="hidden" name="action" value="itinerary_image_delete">
                          <input type="hidden" name="image_id" value="<?= e((string) $img['id']) ?>">
                          <button type="submit" class="w-full rounded bg-rose-50 px-1 py-0.5 text-[10px] font-semibold text-rose-700">Remove</button>
                        </form>
                      </div>
                    <?php endforeach; ?>
                  </div>
                <?php endif; ?>
                <input type="file" name="image" accept="image/*" class="rounded border px-2 py-1 text-xs">
                <input type="file" name="images[]" multiple accept="image/*" class="rounded border px-2 py-1 text-xs">
                <button class="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Save changes</button>
              </form>
              <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-2" onsubmit="return confirm('Delete this day?')">
                <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="action" value="itinerary_delete">
                <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete day</button>
              </form>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<script>
  const itinerarySearch = document.getElementById('itinerarySearch');
  const blocks = Array.from(document.querySelectorAll('.package-itinerary-block'));
  itinerarySearch?.addEventListener('input', () => {
    const q = itinerarySearch.value.trim().toLowerCase();
    blocks.forEach((block) => {
      const title = block.dataset.packageTitle || '';
      const items = Array.from(block.querySelectorAll('.itinerary-item'));
      let any = false;
      items.forEach((item) => {
        const hay = `${title} ${item.dataset.package || ''} ${item.dataset.title || ''} ${item.dataset.description || ''}`;
        const show = !q || hay.includes(q);
        item.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      block.style.display = !q || any ? '' : 'none';
    });
  });
</script>
<?php render_layout_end(); ?>
