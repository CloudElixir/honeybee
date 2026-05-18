<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$rows = db()->query('SELECT `key`,`value` FROM settings')->fetchAll();
$settings = [];
foreach ($rows as $row) {
    $settings[$row['key']] = $row['value'];
}
$cmsItems = db()->query('SELECT * FROM cms_items ORDER BY section ASC, scope ASC, sort_order ASC, id DESC')->fetchAll();

render_layout_start('Homepage CMS', 'cms');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Homepage Sections</h3>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-4 grid gap-3 sm:grid-cols-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="cms_save">
    <input name="hero_title" value="<?= e($settings['hero_title'] ?? '') ?>" placeholder="Hero title" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <textarea name="hero_subtitle" placeholder="Hero subtitle" class="rounded-lg border px-3 py-2 sm:col-span-2"><?= e($settings['hero_subtitle'] ?? '') ?></textarea>
    <input name="hero_button_text" value="<?= e($settings['hero_button_text'] ?? '') ?>" placeholder="Hero button text" class="rounded-lg border px-3 py-2">
    <input name="hero_button_url" value="<?= e($settings['hero_button_url'] ?? '') ?>" placeholder="Hero button URL" class="rounded-lg border px-3 py-2">
    <textarea name="featured_packages_title" placeholder="Featured packages section title" class="rounded-lg border px-3 py-2 sm:col-span-2"><?= e($settings['featured_packages_title'] ?? '') ?></textarea>
    <textarea name="offers_content" placeholder="Offers content" class="rounded-lg border px-3 py-2 sm:col-span-2"><?= e($settings['offers_content'] ?? '') ?></textarea>
    <textarea name="testimonials_content" placeholder="Testimonials content" class="rounded-lg border px-3 py-2 sm:col-span-2"><?= e($settings['testimonials_content'] ?? '') ?></textarea>
    <div class="sm:col-span-2">
      <label class="mb-1 block text-sm font-medium">Hero banner image</label>
      <input type="file" name="hero_banner" accept="image/*" class="w-full rounded-lg border px-3 py-2">
      <?php if (!empty($settings['hero_banner'])): ?>
        <img src="<?= e($settings['hero_banner']) ?>" alt="" class="mt-2 h-32 rounded-lg">
      <?php endif; ?>
    </div>
    <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save CMS</button>
  </form>
</section>
<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Manage homepage cards/sections</h3>
  <p class="mt-1 text-sm text-slate-500">Use sections like: signature (existing curated section), travel_style, gram</p>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-4 grid gap-3 sm:grid-cols-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="cms_item_save">
    <input name="section" required placeholder="Section key (e.g. signature)" class="rounded-lg border px-3 py-2">
    <input name="scope" placeholder="Scope (international/domestic/global)" value="global" class="rounded-lg border px-3 py-2">
    <input name="title" required placeholder="Title" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="subtitle" placeholder="Subtitle" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="image_url" placeholder="Image URL" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="link_url" placeholder="Link URL (/packages/...)" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="duration" placeholder="Duration (e.g. 5D/4N)" class="rounded-lg border px-3 py-2">
    <input name="price" type="number" step="0.01" placeholder="Price" class="rounded-lg border px-3 py-2">
    <input name="badge" placeholder="Badge key" class="rounded-lg border px-3 py-2">
    <input name="tags" placeholder="Tags comma-separated (beach,signature)" class="rounded-lg border px-3 py-2">
    <input name="sort_order" type="number" value="0" class="rounded-lg border px-3 py-2">
    <select name="status" class="rounded-lg border px-3 py-2"><option value="active">Active</option><option value="inactive">Inactive</option></select>
    <textarea name="extra_json" placeholder='Extra JSON (optional) {"location":"Bali"}' class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
    <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Item</button>
  </form>

  <div class="mt-5 overflow-x-auto">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-600">
        <tr><th class="px-3 py-2">Section</th><th class="px-3 py-2">Scope</th><th class="px-3 py-2">Title</th><th class="px-3 py-2">Tags</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Actions</th></tr>
      </thead>
      <tbody>
        <?php foreach ($cmsItems as $item): ?>
          <tr class="border-t border-slate-100 align-top">
            <td class="px-3 py-2"><?= e($item['section']) ?></td>
            <td class="px-3 py-2"><?= e($item['scope']) ?></td>
            <td class="px-3 py-2"><?= e($item['title']) ?></td>
            <td class="px-3 py-2"><?= e($item['tags']) ?></td>
            <td class="px-3 py-2"><?= e($item['status']) ?></td>
            <td class="px-3 py-2">
              <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete CMS item?')">
                <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="action" value="cms_item_delete">
                <input type="hidden" name="id" value="<?= e((string) $item['id']) ?>">
                <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>
<?php render_layout_end(); ?>

