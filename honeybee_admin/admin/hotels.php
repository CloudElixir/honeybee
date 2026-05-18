<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$packages = db()->query('SELECT id, title FROM packages ORDER BY title')->fetchAll();
$hotels = db()->query('SELECT h.*, p.title AS package_title FROM package_hotels h JOIN packages p ON p.id=h.package_id ORDER BY h.id DESC')->fetchAll();
$hotelImages = db()->query('SELECT id, hotel_id, image_path FROM hotel_images ORDER BY id DESC')->fetchAll();
$imagesByHotel = [];
foreach ($hotelImages as $img) {
    $hotelId = (int) ($img['hotel_id'] ?? 0);
    if (!isset($imagesByHotel[$hotelId])) {
        $imagesByHotel[$hotelId] = [];
    }
    $imagesByHotel[$hotelId][] = $img;
}

render_layout_start('Hotels', 'hotels');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Add hotel info per package</h3>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-4 space-y-3">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="hotel_save">
    <select name="package_id" required class="w-full rounded-lg border px-3 py-2">
      <option value="">Choose package</option>
      <?php foreach ($packages as $p): ?><option value="<?= e((string) $p['id']) ?>"><?= e($p['title']) ?></option><?php endforeach; ?>
    </select>
    <input name="name" required placeholder="Hotel name" class="w-full rounded-lg border px-3 py-2">
    <input name="location" required placeholder="Hotel location" class="w-full rounded-lg border px-3 py-2">
    <select name="hotel_type" required class="w-full rounded-lg border px-3 py-2">
      <option value="3-star" selected>3 Star</option>
      <option value="4-star">4 Star</option>
      <option value="5-star">5 Star</option>
    </select>
    <input name="star_rating" type="number" step="0.1" min="0" max="5" placeholder="Star rating (0–5, optional)" class="w-full rounded-lg border px-3 py-2">
    <textarea name="amenities" placeholder="Amenities (comma or line separated)" class="w-full rounded-lg border px-3 py-2"></textarea>
    <textarea name="description" placeholder="Hotel description" class="w-full rounded-lg border px-3 py-2"></textarea>
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700">Hotel cover image</label>
      <input type="file" name="image" accept="image/*" class="w-full rounded-lg border px-3 py-2">
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700">Additional hotel images</label>
      <input type="file" name="images[]" multiple accept="image/*" class="w-full rounded-lg border px-3 py-2">
    </div>
    <textarea name="notes" placeholder="Notes" class="w-full rounded-lg border px-3 py-2"></textarea>
    <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Hotel</button>
  </form>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <h4 class="font-semibold">Saved Hotels</h4>
  <input id="hotelSearch" placeholder="Search hotels or package..." class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
  <div class="mt-3 space-y-3">
    <?php foreach ($hotels as $row): ?>
      <article class="rounded-lg border border-slate-200 p-3 hotel-item" data-package="<?= e(strtolower((string) $row['package_title'])) ?>" data-name="<?= e(strtolower((string) $row['name'])) ?>" data-location="<?= e(strtolower((string) $row['location'])) ?>">
        <p class="text-xs uppercase tracking-wide text-slate-500"><?= e($row['package_title']) ?></p>
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-2 grid gap-2 rounded border border-slate-200 p-2">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="hotel_save">
          <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
          <select name="package_id" required class="rounded border px-2 py-1 text-xs">
            <?php foreach ($packages as $p): ?>
              <option value="<?= e((string) $p['id']) ?>" <?= (int) $p['id'] === (int) $row['package_id'] ? 'selected' : '' ?>><?= e($p['title']) ?></option>
            <?php endforeach; ?>
          </select>
          <input name="name" value="<?= e($row['name']) ?>" class="rounded border px-2 py-1 text-xs">
          <input name="location" value="<?= e($row['location']) ?>" class="rounded border px-2 py-1 text-xs">
          <select name="hotel_type" class="rounded border px-2 py-1 text-xs">
            <option value="3-star" <?= (($row['hotel_type'] ?? '3-star') === '3-star') ? 'selected' : '' ?>>3 Star</option>
            <option value="4-star" <?= (($row['hotel_type'] ?? '3-star') === '4-star') ? 'selected' : '' ?>>4 Star</option>
            <option value="5-star" <?= (($row['hotel_type'] ?? '3-star') === '5-star') ? 'selected' : '' ?>>5 Star</option>
          </select>
          <input name="star_rating" type="number" step="0.1" min="0" max="5" value="<?= e((string) ($row['star_rating'] ?? '')) ?>" placeholder="Rating" class="rounded border px-2 py-1 text-xs">
          <textarea name="amenities" placeholder="Amenities" class="rounded border px-2 py-1 text-xs"><?= e((string) ($row['amenities'] ?? '')) ?></textarea>
          <textarea name="description" placeholder="Description" class="rounded border px-2 py-1 text-xs"><?= e((string) ($row['description'] ?? '')) ?></textarea>
          <?php if (!empty($row['image_path'])): ?>
            <img src="<?= e($row['image_path']) ?>" alt="<?= e($row['name']) ?>" class="h-20 w-full rounded object-cover">
          <?php endif; ?>
          <?php $hotelGallery = $imagesByHotel[(int) $row['id']] ?? []; ?>
          <?php if (!empty($hotelGallery)): ?>
            <div class="grid grid-cols-3 gap-2">
              <?php foreach ($hotelGallery as $img): ?>
                <img src="<?= e($img['image_path']) ?>" alt="" class="h-14 w-full rounded object-cover">
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
          <input type="file" name="image" accept="image/*" class="rounded border px-2 py-1 text-xs">
          <input type="file" name="images[]" multiple accept="image/*" class="rounded border px-2 py-1 text-xs">
          <textarea name="notes" class="rounded border px-2 py-1 text-xs"><?= e($row['notes']) ?></textarea>
          <button class="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Update</button>
        </form>
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-2" onsubmit="return confirm('Delete hotel?')">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="hotel_delete">
          <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
          <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
        </form>
      </article>
    <?php endforeach; ?>
  </div>
</section>
<script>
  const hotelSearch = document.getElementById('hotelSearch');
  const hotelItems = Array.from(document.querySelectorAll('.hotel-item'));
  hotelSearch?.addEventListener('input', () => {
    const q = hotelSearch.value.trim().toLowerCase();
    hotelItems.forEach((item) => {
      const hay = `${item.dataset.package || ''} ${item.dataset.name || ''} ${item.dataset.location || ''}`;
      item.style.display = !q || hay.includes(q) ? '' : 'none';
    });
  });
</script>
<?php render_layout_end(); ?>

