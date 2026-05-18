<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$rows = db()->query('SELECT * FROM blogs ORDER BY id DESC')->fetchAll();
$blogImages = db()->query('SELECT id, blog_id, image_path FROM blog_images ORDER BY id DESC')->fetchAll();
$imagesByBlog = [];
foreach ($blogImages as $img) {
    $blogId = (int) ($img['blog_id'] ?? 0);
    if (!isset($imagesByBlog[$blogId])) {
        $imagesByBlog[$blogId] = [];
    }
    $imagesByBlog[$blogId][] = $img;
}

render_layout_start('Blogs', 'blogs');
?>
<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Add blog post</h3>
  <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-4 grid gap-3 sm:grid-cols-2">
    <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="action" value="blog_save">
    <input name="title" required placeholder="Blog title" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input name="slug" required placeholder="Slug (e.g. bali-vs-thailand)" class="rounded-lg border px-3 py-2">
    <select name="status" class="rounded-lg border px-3 py-2">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <textarea name="excerpt" placeholder="Short excerpt" class="rounded-lg border px-3 py-2 sm:col-span-2"></textarea>
    <textarea name="content" required placeholder="Full content (rich text HTML allowed)" class="rounded-lg border px-3 py-2 sm:col-span-2" rows="8"></textarea>
    <input name="cover_image" placeholder="Cover image URL (optional)" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <input type="file" name="images[]" multiple accept="image/*" class="rounded-lg border px-3 py-2 sm:col-span-2">
    <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Blog</button>
  </form>
</section>

<section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold">Saved blogs</h3>
  <div class="mt-4 space-y-3">
    <?php foreach ($rows as $b): ?>
      <article class="rounded-lg border border-slate-200 p-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold"><?= e($b['title']) ?></p>
            <p class="mt-1 text-xs text-slate-500">Slug: <?= e($b['slug']) ?> | Status: <?= e($b['status']) ?></p>
          </div>
          <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" onsubmit="return confirm('Delete blog?')">
            <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
            <input type="hidden" name="action" value="blog_delete">
            <input type="hidden" name="id" value="<?= e((string) $b['id']) ?>">
            <button class="rounded bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
          </form>
        </div>
        <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" enctype="multipart/form-data" class="mt-3 grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="blog_save">
          <input type="hidden" name="id" value="<?= e((string) $b['id']) ?>">
          <input name="title" value="<?= e($b['title']) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <input name="slug" value="<?= e($b['slug']) ?>" class="rounded border px-2 py-1 text-xs">
          <select name="status" class="rounded border px-2 py-1 text-xs">
            <option value="active" <?= $b['status'] === 'active' ? 'selected' : '' ?>>Active</option>
            <option value="inactive" <?= $b['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option>
          </select>
          <textarea name="excerpt" class="rounded border px-2 py-1 text-xs sm:col-span-2" rows="2"><?= e((string) ($b['excerpt'] ?? '')) ?></textarea>
          <textarea name="content" class="rounded border px-2 py-1 text-xs sm:col-span-2" rows="6"><?= e((string) ($b['content'] ?? '')) ?></textarea>
          <input name="cover_image" value="<?= e((string) ($b['cover_image'] ?? '')) ?>" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <?php $blogGallery = $imagesByBlog[(int) $b['id']] ?? []; ?>
          <?php if (!empty($blogGallery)): ?>
            <div class="sm:col-span-2 grid grid-cols-4 gap-2">
              <?php foreach ($blogGallery as $img): ?>
                <img src="<?= e($img['image_path']) ?>" alt="" class="h-16 w-full rounded object-cover">
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
          <input type="file" name="images[]" multiple accept="image/*" class="rounded border px-2 py-1 text-xs sm:col-span-2">
          <button class="w-fit rounded bg-indigo-600 px-3 py-1.5 text-xs text-white">Update Blog</button>
        </form>
      </article>
    <?php endforeach; ?>
  </div>
</section>
<?php render_layout_end(); ?>

