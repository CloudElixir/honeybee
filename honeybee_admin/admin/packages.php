<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$packages = db()->query('SELECT * FROM packages ORDER BY id DESC')->fetchAll();
$imagesByPackage = [];
$imgRows = db()->query('SELECT id, package_id, image_path FROM package_images ORDER BY id DESC')->fetchAll();
foreach ($imgRows as $img) {
    $pid = (int) ($img['package_id'] ?? 0);
    if (!isset($imagesByPackage[$pid])) {
        $imagesByPackage[$pid] = [];
    }
    $imagesByPackage[$pid][] = $img;
}

render_layout_start('Packages Management', 'packages');
?>
<?php
$internationalLocations = [
    'Azerbaijan',
    'Bali',
    'Bhutan',
    'Cambodia',
    'China',
    'Dubai',
    'Georgia',
    'HongKong',
    'Japan',
    'Kazakhstan',
    'Laos',
    'Malaysia',
    'Maldives',
    'Nepal',
    'Philippines',
    'Singapore',
    'Singapore & Malaysia',
    'South Korea',
    'Srilanka',
    'Thailand',
    'Vietnam',
    'Egypt',
    'Kenya',
    'Kenya & Tanzania',
    'Mauritius',
    'Seychelles',
    'South Africa',
    'Tanzania',
    'Switzerland',
    'France',
    'Italy',
    'UK & Scotland',
    'Central Europe',
    'Australia',
    'New Zealand',
];

$domesticLocations = [
    '3 Sisters',
    'Andaman',
    'Arunachal Pradesh',
    'Goa',
    'Gujarat',
    'Himachal',
    'Karnataka',
    'Kashmir',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Maharashtra',
    'Meghalaya',
    'Orissa',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Uttarakhand',
    'Varanasi',
    'West Bengal',
];
?>
<div class="mb-4 flex items-center justify-between">
  <p class="text-sm text-slate-500">Add, edit, delete international and domestic packages with images.</p>
  <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onclick="document.getElementById('pkgModal').showModal()">+ Add Package</button>
</div>

<div class="mb-3 grid gap-3 sm:grid-cols-3">
  <input id="pkgSearch" placeholder="Search package title/location..." class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
  <select id="pkgCategoryFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
    <option value="">All categories</option>
    <option value="International">International</option>
    <option value="Domestic">Domestic</option>
  </select>
  <select id="pkgStatusFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
    <option value="">All statuses</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div class="overflow-x-auto">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-600">
        <tr>
          <th class="px-3 py-2">Title</th><th class="px-3 py-2">Category</th><th class="px-3 py-2">Location</th><th class="px-3 py-2">Price</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($packages as $pkg): ?>
        <tr class="border-t border-slate-100 package-row" data-title="<?= e(strtolower((string) $pkg['title'])) ?>" data-location="<?= e(strtolower((string) $pkg['location'])) ?>" data-category="<?= e((string) $pkg['category']) ?>" data-status="<?= e((string) $pkg['status']) ?>">
          <td class="px-3 py-2 font-medium"><?= e($pkg['title']) ?></td>
          <td class="px-3 py-2"><?= e($pkg['category']) ?></td>
          <td class="px-3 py-2"><?= e($pkg['location']) ?></td>
          <td class="px-3 py-2">INR <?= e((string) $pkg['price']) ?></td>
          <td class="px-3 py-2"><?= e($pkg['status']) ?></td>
          <td class="px-3 py-2">
            <details>
              <summary class="cursor-pointer text-xs font-semibold text-indigo-600">Manage</summary>
              <div class="mt-2 space-y-3">
                <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="grid gap-2 rounded border border-slate-200 p-2">
                  <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="package_save">
                  <input type="hidden" name="id" value="<?= e((string) $pkg['id']) ?>">
                  <input name="title" value="<?= e($pkg['title']) ?>" class="rounded border px-2 py-1 text-xs">
                  <div class="grid grid-cols-2 gap-2">
                    <select name="category" class="rounded border px-2 py-1 text-xs"><option <?= $pkg['category'] === 'International' ? 'selected' : '' ?>>International</option><option <?= $pkg['category'] === 'Domestic' ? 'selected' : '' ?>>Domestic</option></select>
                    <select name="status" class="rounded border px-2 py-1 text-xs"><option value="active" <?= $pkg['status'] === 'active' ? 'selected' : '' ?>>Active</option><option value="inactive" <?= $pkg['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option></select>
                  </div>
                  <input name="location" value="<?= e($pkg['location']) ?>" class="rounded border px-2 py-1 text-xs">
                  <input name="price" type="number" step="0.01" value="<?= e((string) $pkg['price']) ?>" class="rounded border px-2 py-1 text-xs">
                  <input name="duration" value="<?= e($pkg['duration']) ?>" class="rounded border px-2 py-1 text-xs">
                  <div class="grid grid-cols-3 gap-1 sm:col-span-2">
                    <input name="tier_price_3_star" type="number" step="0.01" value="<?= e((string) ($pkg['tier_price_3_star'] ?? '')) ?>" placeholder="3★ INR" class="rounded border px-1 py-1 text-[11px]">
                    <input name="tier_price_4_star" type="number" step="0.01" value="<?= e((string) ($pkg['tier_price_4_star'] ?? '')) ?>" placeholder="4★ INR" class="rounded border px-1 py-1 text-[11px]">
                    <input name="tier_price_5_star" type="number" step="0.01" value="<?= e((string) ($pkg['tier_price_5_star'] ?? '')) ?>" placeholder="5★ INR" class="rounded border px-1 py-1 text-[11px]">
                  </div>
                  <input name="ideal_for" value="<?= e((string) ($pkg['ideal_for'] ?? '')) ?>" placeholder="Ideal for" class="rounded border px-2 py-1 text-xs sm:col-span-2">
                  <input name="best_time_visit" value="<?= e((string) ($pkg['best_time_visit'] ?? '')) ?>" placeholder="Best time to visit" class="rounded border px-2 py-1 text-xs sm:col-span-2">
                  <input name="covered_destinations" value="<?= e((string) ($pkg['covered_destinations'] ?? '')) ?>" placeholder="Destinations covered" class="rounded border px-2 py-1 text-xs sm:col-span-2">
                  <textarea name="cancellation_policy" class="rounded border px-2 py-1 text-xs sm:col-span-2" placeholder="Cancellation (one rule per line)"><?= e((string) ($pkg['cancellation_policy'] ?? '')) ?></textarea>
                  <input name="slug" value="<?= e($pkg['slug']) ?>" placeholder="slug" class="rounded border px-2 py-1 text-xs">
                  <textarea name="short_desc" class="rounded border px-2 py-1 text-xs" placeholder="Short desc"><?= e($pkg['short_desc']) ?></textarea>
                  <textarea name="full_desc" class="rounded border px-2 py-1 text-xs" placeholder="Full desc"><?= e($pkg['full_desc']) ?></textarea>
                  <input name="highlights" value="<?= e($pkg['highlights']) ?>" placeholder="Highlights" class="rounded border px-2 py-1 text-xs">
                  <input name="inclusions" value="<?= e($pkg['inclusions']) ?>" placeholder="Inclusions" class="rounded border px-2 py-1 text-xs">
                  <input name="exclusions" value="<?= e($pkg['exclusions']) ?>" placeholder="Exclusions" class="rounded border px-2 py-1 text-xs">
                  <textarea name="important_notes" class="rounded border px-2 py-1 text-xs" placeholder="Important notes (one per line)"><?= e($pkg['important_notes'] ?? '') ?></textarea>
                  <textarea name="terms" class="rounded border px-2 py-1 text-xs" placeholder="Terms (one per line)"><?= e($pkg['terms'] ?? '') ?></textarea>
                  <textarea name="faq" class="rounded border px-2 py-1 text-xs" placeholder="FAQ (Q: ... | A: ...)"><?= e($pkg['faq'] ?? '') ?></textarea>
                  <textarea name="blog_content" class="rounded border px-2 py-1 text-xs" placeholder="Detailed blog content (HTML supported)"><?= e($pkg['blog_content'] ?? '') ?></textarea>
                  <input name="meta_title" value="<?= e($pkg['meta_title']) ?>" placeholder="Meta title" class="rounded border px-2 py-1 text-xs">
                  <input name="meta_description" value="<?= e($pkg['meta_description']) ?>" placeholder="Meta description" class="rounded border px-2 py-1 text-xs">
                  <label class="text-xs"><input type="checkbox" name="featured" value="1" <?= (int) $pkg['featured'] === 1 ? 'checked' : '' ?>> Featured</label>
                  <label class="text-xs"><input type="checkbox" name="is_featured" value="1" <?= (int) ($pkg['is_featured'] ?? 0) === 1 ? 'checked' : '' ?>> HoneyBee Pick</label>
                  <label class="text-xs"><input type="checkbox" name="is_curated" value="1" <?= (int) ($pkg['is_curated'] ?? 0) === 1 ? 'checked' : '' ?>> Curated</label>
                  <label class="text-xs"><input type="checkbox" name="is_trending" value="1" <?= (int) ($pkg['is_trending'] ?? 0) === 1 ? 'checked' : '' ?>> Trending</label>
                  <label class="text-xs"><input type="checkbox" name="is_underrated" value="1" <?= (int) ($pkg['is_underrated'] ?? 0) === 1 ? 'checked' : '' ?>> Underrated</label>
                  <div class="rounded border border-slate-200 p-2">
                    <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Images</p>
                    <?php $pkgImages = $imagesByPackage[(int) $pkg['id']] ?? []; ?>
                    <?php if (!empty($pkgImages)): ?>
                      <div class="grid grid-cols-3 gap-2">
                        <?php foreach ($pkgImages as $img): ?>
                          <div class="space-y-1">
                            <img src="<?= e($img['image_path']) ?>" alt="" class="h-14 w-full rounded object-cover">
                          </div>
                        <?php endforeach; ?>
                      </div>
                    <?php else: ?>
                      <p class="text-[11px] text-slate-500">No images uploaded.</p>
                    <?php endif; ?>
                  </div>
                  <input type="file" name="images[]" multiple accept="image/*" class="rounded border px-2 py-1 text-xs">
                  <button class="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Quick Update</button>
                </form>
                <?php if (!empty($pkgImages)): ?>
                  <div class="grid grid-cols-3 gap-2">
                    <?php foreach ($pkgImages as $img): ?>
                      <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete this image?')" class="rounded border border-slate-200 p-1">
                        <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                        <input type="hidden" name="action" value="package_image_delete">
                        <input type="hidden" name="image_id" value="<?= e((string) $img['id']) ?>">
                        <input type="hidden" name="package_id" value="<?= e((string) $pkg['id']) ?>">
                        <button class="w-full rounded bg-rose-600 px-1 py-1 text-[10px] text-white">Delete image</button>
                      </form>
                    <?php endforeach; ?>
                  </div>
                <?php endif; ?>
                <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete package?')">
                  <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="package_delete">
                  <input type="hidden" name="id" value="<?= e((string) $pkg['id']) ?>">
                  <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
                </form>
              </div>
            </details>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<dialog id="pkgModal" class="w-full max-w-4xl rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/40" x-data="{ tab: 'basic' }">
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="flex max-h-[90vh] flex-col">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="package_save">
    <div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
      <h3 class="text-lg font-semibold text-slate-900">Add package</h3>
      <button type="button" onclick="document.getElementById('pkgModal').close()" class="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100">✕</button>
    </div>
    <div class="flex shrink-0 flex-wrap gap-1 border-b border-slate-200 bg-white px-3 py-2">
      <?php
        $pkgTabs = [
            'basic' => 'Basic',
            'itinerary' => 'Itinerary',
            'hotels' => 'Hotels',
            'images' => 'Images',
            'seo' => 'SEO & extras',
        ];
      foreach ($pkgTabs as $key => $label): ?>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="tab === '<?= e($key) ?>' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          @click.prevent="tab = '<?= e($key) ?>'"
        ><?= e($label) ?></button>
      <?php endforeach; ?>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto p-5">
      <div x-show="tab === 'basic'" class="grid gap-3 sm:grid-cols-2">
        <input name="title" required placeholder="Title" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <select id="pkgCategory" name="category" class="rounded-lg border border-slate-300 px-3 py-2"><option>International</option><option>Domestic</option></select>
        <select id="pkgLocation" name="location" required class="rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Select country / location</option>
        </select>
        <input name="price" type="number" step="0.01" required placeholder="Price (INR)" class="rounded-lg border border-slate-300 px-3 py-2">
        <input name="duration" required placeholder="Duration (e.g. 6D/5N)" class="rounded-lg border border-slate-300 px-3 py-2">
        <div class="grid gap-2 sm:grid-cols-3 sm:col-span-2">
          <input name="tier_price_3_star" type="number" step="0.01" placeholder="3★ tier price (INR)" class="rounded-lg border border-slate-300 px-3 py-2">
          <input name="tier_price_4_star" type="number" step="0.01" placeholder="4★ tier price (INR)" class="rounded-lg border border-slate-300 px-3 py-2">
          <input name="tier_price_5_star" type="number" step="0.01" placeholder="5★ tier price (INR)" class="rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <input name="ideal_for" placeholder="Ideal for (e.g. Honeymoon, Couples)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <input name="best_time_visit" placeholder="Best time to visit" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <input name="covered_destinations" placeholder="Destinations covered" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <textarea name="short_desc" placeholder="Short description" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="full_desc" placeholder="Full description (HTML allowed)" class="min-h-[100px] rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="highlights" placeholder="Highlights (comma or line separated)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="inclusions" placeholder="Inclusions" class="rounded-lg border border-slate-300 px-3 py-2"></textarea>
        <textarea name="exclusions" placeholder="Exclusions" class="rounded-lg border border-slate-300 px-3 py-2"></textarea>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
          <p class="mb-2 text-xs font-semibold text-slate-700">Homepage flags</p>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" value="1"> Featured</label>
          <label class="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" value="1"> HoneyBee Pick</label>
          <label class="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="is_curated" value="1"> Curated</label>
          <label class="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="is_trending" value="1"> Trending</label>
          <label class="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="is_underrated" value="1"> Underrated</label>
        </div>
        <select name="status" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>

      <div x-show="tab === 'itinerary'" class="rounded-xl border border-dashed border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        <p class="font-semibold">After you save this package</p>
        <p class="mt-2 text-amber-900/90">Open <a class="font-semibold text-amber-950 underline" href="<?= e(app_path('/admin/itineraries.php')) ?>">Itineraries</a> to add day-by-day plans, photos, and reorder days.</p>
      </div>

      <div x-show="tab === 'hotels'" class="rounded-xl border border-dashed border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
        <p class="font-semibold">Hotels are linked per package</p>
        <p class="mt-2 text-sky-900/90">Once saved, add stays under <a class="font-semibold text-sky-950 underline" href="<?= e(app_path('/admin/hotels.php')) ?>">Hotels</a> (star rating, amenities, gallery).</p>
      </div>

      <div x-show="tab === 'images'" class="grid gap-3">
        <p class="text-sm text-slate-600">Upload one or more gallery images. First image is used as the card thumbnail when no separate cover is set.</p>
        <input type="file" name="images[]" multiple accept="image/*" class="w-full rounded-lg border border-slate-300 px-3 py-2">
      </div>

      <div x-show="tab === 'seo'" class="grid gap-3 sm:grid-cols-2">
        <input name="slug" placeholder="URL slug" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <input name="meta_title" placeholder="Meta title" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2">
        <textarea name="meta_description" placeholder="Meta description" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="important_notes" placeholder="Important notes (one per line)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="terms" placeholder="Terms (one per line)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="cancellation_policy" placeholder="Cancellation policy (one rule per line)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="faq" placeholder="FAQ (Q: ... | A: ...)" class="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
        <textarea name="blog_content" placeholder="Long-form content / blog (HTML allowed)" class="min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"></textarea>
      </div>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
      <button type="button" onclick="document.getElementById('pkgModal').close()" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">Cancel</button>
      <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save package</button>
    </div>
  </form>
</dialog>
<script>
  const locationOptionsByCategory = {
    International: <?= json_encode($internationalLocations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
    Domestic: <?= json_encode($domesticLocations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
  };

  const pkgCategoryInput = document.getElementById('pkgCategory');
  const pkgLocationInput = document.getElementById('pkgLocation');

  function populateLocationOptions() {
    if (!pkgCategoryInput || !pkgLocationInput) return;
    const category = pkgCategoryInput.value === 'Domestic' ? 'Domestic' : 'International';
    const locations = locationOptionsByCategory[category] || [];
    const currentValue = pkgLocationInput.value;

    pkgLocationInput.innerHTML = '';
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select country / location';
    pkgLocationInput.appendChild(placeholderOption);

    locations.forEach((locationName) => {
      const option = document.createElement('option');
      option.value = locationName;
      option.textContent = locationName;
      pkgLocationInput.appendChild(option);
    });

    if (locations.includes(currentValue)) {
      pkgLocationInput.value = currentValue;
    } else {
      pkgLocationInput.value = '';
    }
  }

  pkgCategoryInput?.addEventListener('change', populateLocationOptions);
  populateLocationOptions();

  const searchEl = document.getElementById('pkgSearch');
  const categoryEl = document.getElementById('pkgCategoryFilter');
  const statusEl = document.getElementById('pkgStatusFilter');
  const rows = Array.from(document.querySelectorAll('.package-row'));

  function filterRows() {
    const q = (searchEl?.value || '').trim().toLowerCase();
    const category = categoryEl?.value || '';
    const status = statusEl?.value || '';

    rows.forEach((row) => {
      const title = row.dataset.title || '';
      const location = row.dataset.location || '';
      const rowCategory = row.dataset.category || '';
      const rowStatus = row.dataset.status || '';
      const matchSearch = !q || title.includes(q) || location.includes(q);
      const matchCategory = !category || rowCategory === category;
      const matchStatus = !status || rowStatus === status;
      row.style.display = (matchSearch && matchCategory && matchStatus) ? '' : 'none';
    });
  }

  searchEl?.addEventListener('input', filterRows);
  categoryEl?.addEventListener('change', filterRows);
  statusEl?.addEventListener('change', filterRows);
</script>
<?php render_layout_end(); ?>

