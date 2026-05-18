<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$search = trim((string) ($_GET['q'] ?? ''));
$sql = 'SELECT * FROM enquiries';
if ($search !== '') {
    $stmt = db()->prepare($sql . ' WHERE name LIKE :q OR email LIKE :q OR message LIKE :q ORDER BY id DESC');
    $stmt->execute([':q' => "%{$search}%"]);
    $rows = $stmt->fetchAll();
} else {
    $rows = db()->query($sql . ' ORDER BY id DESC')->fetchAll();
}

render_layout_start('Enquiry Management', 'enquiries');
?>
<form class="mb-4">
  <input name="q" value="<?= e($search) ?>" placeholder="Filter enquiries" class="w-full max-w-sm rounded-lg border px-3 py-2">
</form>

<div class="space-y-3">
  <?php foreach ($rows as $row): ?>
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p class="font-semibold"><?= e($row['name']) ?> <span class="text-sm font-normal text-slate-500">(<?= e($row['email']) ?>)</span></p>
      <p class="mt-1 text-sm text-slate-700"><?= e($row['message']) ?></p>
      <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-3 grid gap-2 sm:grid-cols-3">
        <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="action" value="enquiry_update">
        <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
        <select name="status" class="rounded-lg border px-3 py-2">
          <?php foreach (['new','contacted','converted'] as $s): ?>
            <option value="<?= $s ?>" <?= $row['status'] === $s ? 'selected' : '' ?>><?= ucfirst($s) ?></option>
          <?php endforeach; ?>
        </select>
        <input name="notes" value="<?= e($row['notes']) ?>" placeholder="Notes" class="rounded-lg border px-3 py-2 sm:col-span-2">
        <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Update</button>
      </form>
    </article>
  <?php endforeach; ?>
</div>
<?php render_layout_end(); ?>

