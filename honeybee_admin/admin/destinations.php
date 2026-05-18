<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$destinations = db()->query('SELECT * FROM destinations ORDER BY id DESC')->fetchAll();
$packages = db()->query('SELECT id, title FROM packages ORDER BY title')->fetchAll();
$destinationImages = db()->query('SELECT id, destination_id, image_path FROM destination_images ORDER BY id DESC')->fetchAll();
$imagesByDestination = [];
foreach ($destinationImages as $img) {
    $destinationId = (int) ($img['destination_id'] ?? 0);
    if (!isset($imagesByDestination[$destinationId])) {
        $imagesByDestination[$destinationId] = [];
    }
    $imagesByDestination[$destinationId][] = $img;
}

$internationalCountries = [
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

$domesticCountries = [
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

render_layout_start('Destinations Management', 'destinations');
?>
<div class="mb-4 flex items-center justify-between">
  <p class="text-sm text-slate-500">Manage destination pages, images, and package linking.</p>
  <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onclick="document.getElementById('destinationModal').showModal()">+ Add Destination</button>
</div>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
  <?php foreach ($destinations as $d): ?>
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <?php if (!empty($d['cover_image'])): ?>
        <img src="<?= e($d['cover_image']) ?>" alt="" class="mb-3 h-36 w-full rounded-lg object-cover">
      <?php endif; ?>
      <h3 class="text-lg font-semibold"><?= e($d['name']) ?></h3>
      <p class="text-sm text-slate-500"><?= e(trim((string) ($d['continent'] ?? '')) !== '' ? ($d['continent'] . ' · ' . $d['country']) : $d['country']) ?></p>
      <p class="mt-2 line-clamp-3 text-sm text-slate-700"><?= e($d['description']) ?></p>
      <?php $destinationGallery = $imagesByDestination[(int) $d['id']] ?? []; ?>
      <?php if (!empty($destinationGallery)): ?>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <?php foreach ($destinationGallery as $img): ?>
            <div class="space-y-1">
              <img src="<?= e($img['image_path']) ?>" alt="" class="h-16 w-full rounded object-cover">
              <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete this destination image?')">
                <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="action" value="destination_image_delete">
                <input type="hidden" name="image_id" value="<?= e((string) $img['id']) ?>">
                <button class="w-full rounded bg-rose-600 px-1 py-1 text-[10px] text-white">Delete image</button>
              </form>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
      <details class="mt-3">
        <summary class="cursor-pointer text-xs font-semibold text-indigo-600">Quick Edit</summary>
        <?php $rowScope = in_array((string) $d['country'], $domesticCountries, true) ? 'Domestic' : 'International'; ?>
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-2 grid gap-2 destination-edit-form">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="destination_save">
          <input type="hidden" name="id" value="<?= e((string) $d['id']) ?>">
          <input name="name" value="<?= e($d['name']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="continent" value="<?= e((string) ($d['continent'] ?? '')) ?>" placeholder="Continent (e.g. Europe)" class="rounded border px-2 py-1 text-xs">
          <select name="destination_scope" class="rounded border px-2 py-1 text-xs destination-scope">
            <option value="International" <?= $rowScope === 'International' ? 'selected' : '' ?>>International</option>
            <option value="Domestic" <?= $rowScope === 'Domestic' ? 'selected' : '' ?>>Domestic</option>
          </select>
          <select
            name="country"
            class="rounded border px-2 py-1 text-xs destination-country"
            data-selected-country="<?= e((string) $d['country']) ?>"
            required
          ></select>
          <input name="slug" value="<?= e($d['slug']) ?>" placeholder="Slug" class="rounded border px-2 py-1 text-xs">
          <input name="meta_title" value="<?= e($d['meta_title']) ?>" placeholder="Meta title" class="rounded border px-2 py-1 text-xs">
          <input name="meta_description" value="<?= e($d['meta_description']) ?>" placeholder="Meta description" class="rounded border px-2 py-1 text-xs">
          <textarea name="description" class="rounded border px-2 py-1 text-xs"><?= e($d['description']) ?></textarea>
          <input type="file" name="images[]" multiple accept="image/*" class="rounded border px-2 py-1 text-xs">
          <button class="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Update</button>
        </form>
      </details>
      <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-3" onsubmit="return confirm('Delete destination?')">
        <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="action" value="destination_delete">
        <input type="hidden" name="id" value="<?= e((string) $d['id']) ?>">
        <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
      </form>
    </article>
  <?php endforeach; ?>
</div>

<dialog id="destinationModal" class="w-full max-w-3xl rounded-2xl p-0 backdrop:bg-black/40">
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="space-y-4 p-5">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="destination_save">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Add Destination</h3>
      <button type="button" onclick="document.getElementById('destinationModal').close()" class="rounded bg-slate-100 px-2 py-1">✕</button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <input name="name" required placeholder="Destination name" class="rounded-lg border px-3 py-2">
      <input name="continent" placeholder="Continent (Europe, Asia, etc.)" class="rounded-lg border px-3 py-2">
      <select id="destinationScope" name="destination_scope" class="rounded-lg border px-3 py-2">
        <option value="International">International</option>
        <option value="Domestic">Domestic</option>
      </select>
      <select id="destinationCountry" name="country" required class="rounded-lg border px-3 py-2"></select>
      <input name="slug" placeholder="Slug" class="rounded-lg border px-3 py-2">
      <input name="meta_title" placeholder="Meta title" class="rounded-lg border px-3 py-2">
      <textarea name="meta_description" placeholder="Meta description" class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
      <textarea name="description" required placeholder="Description" class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
      <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium">Link packages</label>
        <select name="package_ids[]" multiple class="w-full rounded-lg border px-3 py-2">
          <?php foreach ($packages as $p): ?>
            <option value="<?= e((string) $p['id']) ?>"><?= e($p['title']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium">Cover image</label>
        <input type="file" name="cover_image" accept="image/*" class="w-full rounded-lg border px-3 py-2">
      </div>
      <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium">Additional destination images</label>
        <input type="file" name="images[]" multiple accept="image/*" class="w-full rounded-lg border px-3 py-2">
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" onclick="document.getElementById('destinationModal').close()" class="rounded-lg border px-4 py-2">Cancel</button>
      <button class="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Save Destination</button>
    </div>
  </form>
</dialog>
<script>
  const destinationCountriesByScope = {
    International: <?= json_encode($internationalCountries, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
    Domestic: <?= json_encode($domesticCountries, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
  };

  function setCountryOptions(scopeSelect, countrySelect, selectedCountry = '') {
    if (!scopeSelect || !countrySelect) return;
    const scope = scopeSelect.value === 'Domestic' ? 'Domestic' : 'International';
    const countries = destinationCountriesByScope[scope] || [];
    countrySelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select country';
    countrySelect.appendChild(placeholder);

    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });

    if (selectedCountry && countries.includes(selectedCountry)) {
      countrySelect.value = selectedCountry;
    } else {
      countrySelect.value = '';
    }
  }

  const destinationScope = document.getElementById('destinationScope');
  const destinationCountry = document.getElementById('destinationCountry');
  setCountryOptions(destinationScope, destinationCountry);
  destinationScope?.addEventListener('change', () => setCountryOptions(destinationScope, destinationCountry));

  document.querySelectorAll('.destination-edit-form').forEach((formEl) => {
    const scopeSelect = formEl.querySelector('.destination-scope');
    const countrySelect = formEl.querySelector('.destination-country');
    const selectedCountry = countrySelect?.dataset.selectedCountry || '';
    setCountryOptions(scopeSelect, countrySelect, selectedCountry);
    scopeSelect?.addEventListener('change', () => setCountryOptions(scopeSelect, countrySelect));
  });
</script>
<?php render_layout_end(); ?>

