<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$tabs = [
    'signature' => 'Curated Collections (Existing)',
    'travel_style' => 'Travel Style Trips',
    'gram' => 'Traveler Gallery',
    'recently_itinerary' => 'Recently Itinerary',
    'navbar_mega' => 'Navbar Mega Menu',
];
$activeTab = (string) ($_GET['tab'] ?? 'signature');
if (!isset($tabs[$activeTab])) {
    $activeTab = 'signature';
}

$stmt = db()->prepare('SELECT * FROM cms_items WHERE section=:section ORDER BY sort_order ASC, id DESC');
$stmt->execute([':section' => $activeTab]);
$items = $stmt->fetchAll();

render_layout_start('Website Sections', 'website_sections');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Website Sections CMS</h3>
  <p class="mt-1 text-sm text-slate-500">Manage homepage cards, navbar mega menus, and section ordering in one place.</p>
  <div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
    <p class="text-sm font-semibold text-amber-900">Seed Existing Frontend Data</p>
    <p class="mt-1 text-xs text-amber-800">
      One-click import of existing frontend packages, destinations, and itineraries from
      <code class="rounded bg-amber-100 px-1 py-0.5">migrations/frontend_seed.sql</code>.
    </p>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-3">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="seed_frontend_data">
      <button
        type="submit"
        onclick="return confirm('This will import/update packages, destinations, and itineraries from the frontend seed file. Continue?')"
        class="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
      >
        Seed Existing Frontend Data to CRM
      </button>
    </form>
  </div>
  <div class="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
    <p class="text-sm font-semibold text-indigo-900">Seed Homepage Sections from Packages</p>
    <p class="mt-1 text-xs text-indigo-800">
      Auto-generate rows for <code class="rounded bg-indigo-100 px-1 py-0.5">signature</code>,
      <code class="rounded bg-indigo-100 px-1 py-0.5">travel_style</code>,
      <code class="rounded bg-indigo-100 px-1 py-0.5">luxury_escapes</code>,
      <code class="rounded bg-indigo-100 px-1 py-0.5">inspire_deals</code>,
      <code class="rounded bg-indigo-100 px-1 py-0.5">group_departures</code>,
      and <code class="rounded bg-indigo-100 px-1 py-0.5">trending_destinations</code> using current active packages.
    </p>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-3">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="seed_home_sections_from_packages">
      <button
        type="submit"
        onclick="return confirm('This will replace existing homepage section rows listed above with data from active packages. Continue?')"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
      >
        Seed Homepage Sections
      </button>
    </form>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-2">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="seed_home_sections_non_destructive">
      <button
        type="submit"
        onclick="return confirm('This will only add missing rows and keep your existing homepage section items unchanged. Continue?')"
        class="rounded-lg bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-200"
      >
        Fill Missing Rows Only (Safe Seed)
      </button>
    </form>
  </div>
  <div class="mt-4 flex flex-wrap gap-2">
    <?php foreach ($tabs as $key => $label): ?>
      <a href="<?= e(app_path('/admin/website_sections.php?tab=' . $key)) ?>" class="rounded-full px-3 py-1.5 text-xs font-semibold <?= $activeTab === $key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200' ?>">
        <?= e($label) ?>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h4 class="font-semibold">Add item to <?= e($tabs[$activeTab]) ?></h4>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-4 grid gap-3 sm:grid-cols-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="cms_item_save">
    <input type="hidden" name="section" value="<?= e($activeTab) ?>">
    <input name="scope" value="global" placeholder="Scope (global/international/domestic/themes)" class="rounded-lg border px-3 py-2">
    <input name="sort_order" type="number" value="0" placeholder="Sort order" class="rounded-lg border px-3 py-2">
    <input name="title" required placeholder="Title (destination/card title)" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="subtitle" placeholder="Subtitle or region name" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="image_url" placeholder="Image URL" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="link_url" placeholder="Link URL (/packages or /destinations?q=...)" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="duration" placeholder="Duration" class="rounded-lg border px-3 py-2">
    <input name="price" type="number" step="0.01" placeholder="Price" class="rounded-lg border px-3 py-2">
    <input name="badge" placeholder="Badge key (optional)" class="rounded-lg border px-3 py-2">
    <input name="tags" placeholder="Tags comma-separated" class="rounded-lg border px-3 py-2">
    <select name="status" class="rounded-lg border px-3 py-2">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <textarea name="extra_json" placeholder='Extra JSON (optional) {"region":"Asia"}' class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
    <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add item</button>
  </form>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div class="flex items-center justify-between gap-3">
    <h4 class="font-semibold">Existing items (inline edit + reorder)</h4>
    <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="inline-flex items-center gap-2">
      <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="action" value="cms_items_reorder">
      <input type="hidden" name="section" value="<?= e($activeTab) ?>">
      <?php foreach ($items as $i): ?>
        <input type="hidden" name="sort_orders[<?= e((string) $i['id']) ?>]" value="<?= e((string) $i['sort_order']) ?>" data-sort-input="<?= e((string) $i['id']) ?>">
      <?php endforeach; ?>
      <button class="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Save current order</button>
    </form>
  </div>

  <div class="mt-4 space-y-4">
    <?php foreach ($items as $item): ?>
      <article class="rounded-lg border border-slate-200 p-3">
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="cms_item_save">
          <input type="hidden" name="id" value="<?= e((string) $item['id']) ?>">
          <input type="hidden" name="section" value="<?= e($item['section']) ?>">
          <input name="scope" value="<?= e($item['scope']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="sort_order" type="number" value="<?= e((string) $item['sort_order']) ?>" class="rounded border px-2 py-1 text-xs sort-order-editor" data-item-id="<?= e((string) $item['id']) ?>">
          <input name="title" value="<?= e($item['title']) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <input name="subtitle" value="<?= e($item['subtitle']) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <input name="image_url" value="<?= e($item['image_url']) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <input name="link_url" value="<?= e($item['link_url']) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <input name="duration" value="<?= e($item['duration']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="price" type="number" step="0.01" value="<?= e((string) $item['price']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="badge" value="<?= e($item['badge']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="tags" value="<?= e($item['tags']) ?>" class="rounded border px-2 py-1 text-xs">
          <select name="status" class="rounded border px-2 py-1 text-xs">
            <option value="active" <?= $item['status'] === 'active' ? 'selected' : '' ?>>Active</option>
            <option value="inactive" <?= $item['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option>
          </select>
          <textarea name="extra_json" class="rounded border px-2 py-1 text-xs sm:col-span-2"><?= e($item['extra_json']) ?></textarea>
          <button class="w-fit rounded bg-indigo-600 px-2 py-1 text-xs text-white">Update</button>
        </form>
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-2" onsubmit="return confirm('Delete this item?')">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="cms_item_delete">
          <input type="hidden" name="id" value="<?= e((string) $item['id']) ?>">
          <input type="hidden" name="section" value="<?= e($item['section']) ?>">
          <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
        </form>
      </article>
    <?php endforeach; ?>
    <?php if (!$items): ?>
      <p class="text-sm text-slate-500">No items yet for this tab.</p>
    <?php endif; ?>
  </div>
</section>
<script>
  const editors = Array.from(document.querySelectorAll('.sort-order-editor'));
  editors.forEach((el) => {
    el.addEventListener('input', () => {
      const id = el.dataset.itemId;
      const hidden = document.querySelector(`[data-sort-input="${id}"]`);
      if (hidden) hidden.value = el.value;
    });
  });
</script>
<?php render_layout_end(); ?>

